package services

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Room struct {
	Password string
	Clients  map[*Client]bool
}

type Message struct {
	Type     string `json:"type"`
	RoomID   string `json:"roomID,omitempty"`
	Password string `json:"password,omitempty"`
	Message  string `json:"message,omitempty"`
}

var (
	rooms      = make(map[string]*Room)
	roomsMutex sync.Mutex
)

type Server struct {
	conns map[*websocket.Conn]bool
	mu    sync.Mutex
}

func NewServer() *Server {
	return &Server{
		conns: make(map[*websocket.Conn]bool),
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {

		return true
	},
}

func (s *Server) HandleWS(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrade error:", err)
		return
	}
	fmt.Println("New incoming connection from client:", conn.RemoteAddr())

	// Add connection to the map
	s.mu.Lock()
	s.conns[conn] = true
	s.mu.Unlock()

	// Ensure cleanup when the connection closes
	defer func() {
		s.mu.Lock()
		delete(s.conns, conn)
		s.mu.Unlock()
		conn.Close()
		fmt.Println("Connection closed:", conn.RemoteAddr())
	}()

	// Start reading messages from the connection
	s.readLoop(conn)
}

func (s *Server) readLoop(conn *websocket.Conn) {
	client := &Client{Conn: conn} // Create a new client

	defer func() {
		if client.RoomID != "" {
			roomsMutex.Lock()
			if room, exists := rooms[client.RoomID]; exists {
				delete(room.Clients, client)
				if len(room.Clients) == 0 {
					delete(rooms, client.RoomID)
				}
			}
			roomsMutex.Unlock()
		}
		conn.Close()
		fmt.Println("Connection closed:", conn.RemoteAddr())
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				fmt.Println("Client disconnected:", conn.RemoteAddr())
				break
			}
			fmt.Println("Read error:", err)
			break
		}
		fmt.Printf("Received: %s\n", msg)

		// Parse the message
		var message Message
		if err := json.Unmarshal(msg, &message); err != nil {
			fmt.Println("Invalid message format:", err)
			client.Conn.WriteJSON(Message{
				Type:    "error",
				Message: "Invalid message format",
			})
			continue
		}

		// Handle message types
		switch message.Type {
		case "createRoom":
			handleCreateRoom(client, message)
		case "joinRoom":
			handleJoinRoom(client, message)
		default:
			client.Conn.WriteJSON(Message{
				Type:    "error",
				Message: "Unsupported message type",
			})
		}
	}
}

func (s *Server) broadcastToRoom(roomID string, msg []byte) {
	roomsMutex.Lock()
	defer roomsMutex.Unlock()

	room, exists := rooms[roomID]
	if !exists {
		fmt.Println("Room not found:", roomID)
		return
	}

	for client := range room.Clients {
		go func(client *Client) {
			if err := client.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				fmt.Println("Write error:", err)
			}
		}(client)
	}
}

type Client struct {
	Conn   *websocket.Conn
	RoomID string
}

// Generate a random roomID
func generateRoomID() string {
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

func handleClient(conn *websocket.Conn) {
	client := &Client{Conn: conn}

	defer func() {
		if client.RoomID != "" {
			roomsMutex.Lock()
			if room, exists := rooms[client.RoomID]; exists {
				delete(room.Clients, client)
				if len(room.Clients) == 0 {
					delete(rooms, client.RoomID)
				}
			}
			roomsMutex.Unlock()
		}
		conn.Close()
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}

		var message Message
		if err := json.Unmarshal(msg, &message); err != nil {
			log.Printf("Invalid message format: %v", err)
			continue
		}

		switch message.Type {
		case "createRoom":
			handleCreateRoom(client, message)
		case "joinRoom":
			handleJoinRoom(client, message)
		default:
			client.Conn.WriteJSON(Message{
				Type:    "error",
				Message: "Invalid message type",
			})
		}
	}
}

func handleCreateRoom(client *Client, message Message) {
	roomID := generateRoomID()
	password := message.Password
	if password == "" {
		password = generateRoomID() // Generate password if not provided
	}

	room := &Room{
		Password: password,
		Clients:  make(map[*Client]bool),
	}

	roomsMutex.Lock()
	rooms[roomID] = room
	roomsMutex.Unlock()

	client.RoomID = roomID
	room.Clients[client] = true
	fmt.Printf("Room created: RoomID=%s, Password=%s\n", roomID, password)

	// Send confirmation back to the client
	client.Conn.WriteJSON(Message{
		Type:     "roomCreated",
		RoomID:   roomID,
		Password: password,
		Message:  fmt.Sprintf("Room %s created successfully!", roomID),
	})
}

func handleJoinRoom(client *Client, message Message) {
	roomsMutex.Lock()
	defer roomsMutex.Unlock()

	room, exists := rooms[message.RoomID]
	if !exists {
		client.Conn.WriteJSON(Message{
			Type:    "error",
			Message: "Room does not exist",
		})
		return
	}

	if room.Password != message.Password {
		client.Conn.WriteJSON(Message{
			Type:    "error",
			Message: "Incorrect password",
		})
		return
	}

	client.RoomID = message.RoomID
	room.Clients[client] = true

	client.Conn.WriteJSON(Message{
		Type:    "joinedRoom",
		RoomID:  message.RoomID,
		Message: fmt.Sprintf("Joined room %s successfully!", message.RoomID),
	})
}

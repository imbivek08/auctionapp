package main

import (
	"fmt"
	"net/http"

	"github.com/imbivek08/auction-app/internal/services"
)

func main() {
	server := services.NewServer()

	http.HandleFunc("/ws", server.HandleWS)

	fmt.Println("WebSocket server is running on ws://localhost:3000/ws")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		fmt.Println("Server error:", err)
	}
}

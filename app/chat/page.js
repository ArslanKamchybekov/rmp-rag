"use client";
import { Box, Button, Stack, TextField, Typography, Paper } from "@mui/material";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm ProfPal. You're Rate My Professor RAG assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (message.trim() === "") return; // Prevent sending empty messages
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="grey"  // Dark background for the entire app
      p={3}
    >
      <Paper
        elevation={4}
        sx={{
          width: "90%",
          maxWidth: "600px",
          height: "80%",
          borderRadius: 4,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#121212",  // Dark blue for the chat window
        }}
      >
        <Box
          sx={{
            bgcolor: "#1a1a1d",  // Slightly lighter shade for the header
            color: "#00ffff",  // Cyan text for the header
            p: 2,
            textAlign: "center",
            borderBottom: "1px solid #00ffff",  // Cyan border for separation
          }}
        >
          <Typography variant="h6">Chat with ProfPal Assistant</Typography>
        </Box>
        <Stack
          direction="column"
          spacing={2}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            bgcolor: "#0d0d0d",  // Darker background for messages
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                sx={{
                  bgcolor:
                    message.role === "assistant"
                      ? "#004d4d"  // Dark cyan for assistant messages
                      : "#1c1c1c",  // Dark gray for user messages
                  color: "white",
                  borderRadius: 2,
                  p: 2,
                  maxWidth: "70%",
                  boxShadow: 1,
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          p={2}
          bgcolor="#121212"  // Match chat window background for input area
          borderTop="1px solid #00ffff"  // Cyan border for separation
        >
          <TextField
            label="Type your message"
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            sx={{
              bgcolor: "#1a1a1d",  // Darker input field background
              borderRadius: 1,
              input: { color: "#ffffff" },  // White text in the input field
              label: { color: "#00ffff" },  // Cyan label color
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#00ffff",  // Cyan border for the input field
                },
                "&:hover fieldset": {
                  borderColor: "#00ffff",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00ffff",
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              bgcolor: "#00b8b8",  // Bright cyan for the send button
              color: "#ffffff",
              "&:hover": {
                bgcolor: "#008080",  // Darker cyan on hover
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

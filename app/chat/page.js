"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Button, Stack, TextField, Typography, Paper } from "@mui/material";
import * as THREE from "three";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm ProfPal. You're Rate My Professor RAG assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");
  const mountRef = useRef(null);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    mountRef.current.appendChild(renderer.domElement);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.3,
      sizeAttenuation: true,
    });
    const starVertices = [];

    for (let i = 0; i < 5000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);

      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    camera.position.z = 500;

    const animate = function () {
      requestAnimationFrame(animate);

      // Rotate stars
      stars.rotation.x += 0.0005;
      stars.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resizing
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ position: "relative", overflow: "hidden" }}
    >
      <Box
        ref={mountRef}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />
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
          bgcolor: "#121212",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            bgcolor: "#1a1a1d",
            color: "#00ffff",
            p: 2,
            textAlign: "center",
            borderBottom: "1px solid #00ffff",
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
            bgcolor: "#0d0d0d",
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
                      ? "#004d4d"
                      : "#1c1c1c",
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
          bgcolor="#121212"
          borderTop="1px solid #00ffff"
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
              bgcolor: "#1a1a1d",
              borderRadius: 1,
              input: { color: "#ffffff" },
              label: { color: "#00ffff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#00ffff",
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
              bgcolor: "#00b8b8",
              color: "#ffffff",
              "&:hover": {
                bgcolor: "#008080",
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
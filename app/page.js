"use client";
import { useEffect, useRef } from "react";
import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";
import Link from "next/link";
import * as THREE from "three";

export default function LandingPage() {
  const mountRef = useRef(null);

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
      size: 0.5,
      sizeAttenuation: true,
    });
    const starVertices = [];

    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(1000);
      const y = THREE.MathUtils.randFloatSpread(1000);
      const z = THREE.MathUtils.randFloatSpread(1000);

      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    camera.position.z = 5;

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
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        overflow: "hidden",
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#000",
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: "#000" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#fff" }}>
            RPM RAG
          </Typography>
          <Link href="/chat" passHref>
            <Button sx={{ color: "#fff" }}>Go to Chat</Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="80vh"
        textAlign="center"
        p={4}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Typography variant="h2" gutterBottom sx={{ color: "#fff" }}>
          Welcome to RPM RAG
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ color: "#fff" }}>
          Your AI-powered assistant for finding and reviewing professors. Get insights and generate reviews with the help of AI!
        </Typography>
        <Link href="/chat" passHref>
          <Button variant="contained" color="primary" sx={{ mt: 4 }}>
            Start Chatting
          </Button>
        </Link>
      </Box>

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
    </Box>
  );
}
"use client";
import { useEffect, useRef } from "react";
import { Box, Button, Typography, AppBar, Toolbar, Container } from "@mui/material";
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
    renderer.setClearColor(0x090909, 1);

    mountRef.current.appendChild(renderer.domElement);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      sizeAttenuation: true,
    });
    const starVertices = [];

    for (let i = 0; i < 15000; i++) {
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
      stars.rotation.x += 0.0003;
      stars.rotation.y += 0.0003;

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
        backgroundColor: "#090909",
        color: "#ffffff",
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ProfPal
          </Typography>
          <Link href="/chat" passHref>
            <Button sx={{ color: "#ffffff", border: "1px solid #ffffff", marginLeft: 2 }}>
              Go to Chat
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          textAlign: "center",
          zIndex: 1,
          position: "relative",
        }}
      >
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, color: "#ffffff" }}>
          Welcome to ProfPal
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ color: "#aaaaaa" }}>
          Your AI-powered assistant for finding and reviewing professors. Get insights and generate reviews with the help of AI!
        </Typography>
        <Link href="/chat" passHref>
          <Button variant="contained" color="primary" sx={{ mt:4, px: 4, py: 1.5, fontSize: "1.2rem", borderRadius: "50px", }}>
            Start Chatting
          </Button>
        </Link>
      </Container>

      <Box
        ref={mountRef}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

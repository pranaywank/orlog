"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const ShootingStars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    class Star {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;

      constructor(cw: number, ch: number) {
        this.x = Math.random() * cw;
        this.y = Math.random() * (ch / 2);
        this.length = Math.random() * 60 + 20;
        this.speed = Math.random() * 1.5 + 0.5;
        this.opacity = 0.5;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
          this.x,
          this.y,
          this.x - this.length,
          this.y + this.length
        );
        gradient.addColorStop(0, `rgba(196, 151, 58, ${this.opacity})`);
        gradient.addColorStop(1, "rgba(196, 151, 58, 0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.length, this.y + this.length);
        ctx.stroke();
      }

      update(cw: number, ch: number) {
        this.x -= this.speed;
        this.y += this.speed;

        if (this.x < 0 || this.y > ch) {
          this.x = Math.random() * cw + cw / 2;
          this.y = Math.random() * -100;
        }
      }
    }

    const stars = [
      new Star(canvas.width, canvas.height), 
      new Star(canvas.width, canvas.height), 
      new Star(canvas.width, canvas.height)
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.update(canvas.width, canvas.height);
        star.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 z-0 pointer-events-none")}
    />
  );
};

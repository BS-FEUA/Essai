"use client";

import { useEffect, useRef, useState } from "react";
import { liquidLogoFragmentShader, liquidLogoVertexShader } from "./liquid-logo-shader";

type LiquidLogoProps = { className?: string };

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** A decorative WebGL2 rendering of the local FEUA mark, with a static fallback. */
export function LiquidLogo({ className = "" }: LiquidLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { alpha: true, antialias: true });
    if (!canvas || !gl) {
      setSupported(false);
      return;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, liquidLogoVertexShader);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, liquidLogoFragmentShader);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      setSupported(false);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setSupported(false);
      return;
    }

    const position = gl.getAttribLocation(program, "a_position");
    const time = gl.getUniformLocation(program, "u_time");
    const ratio = gl.getUniformLocation(program, "u_ratio");
    const mask = gl.getUniformLocation(program, "u_mask");
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (position < 0 || !time || !ratio || !mask || !buffer || !texture) {
      setSupported(false);
      return;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(mask, 0);

    const image = new Image();
    image.src = "/feua-logo.png";
    let frame = 0;
    let active = true;
    let resize: (() => void) | null = null;
    image.onload = () => {
      if (!active) return;
      const size = 512;
      const source = document.createElement("canvas");
      source.width = size;
      source.height = size;
      const context = source.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, size, size);
      // The bundled logo is a JPEG-like image on a white background. Convert
      // that near-white background into transparency before it reaches WebGL,
      // so the liquid effect follows the crest rather than a square canvas.
      const pixels = context.getImageData(0, 0, size, size);
      for (let index = 0; index < pixels.data.length; index += 4) {
        const red = pixels.data[index];
        const green = pixels.data[index + 1];
        const blue = pixels.data[index + 2];
        const brightness = (red + green + blue) / 3;
        const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
        if (brightness > 228 && chroma < 26) pixels.data[index + 3] = 0;
      }
      context.putImageData(pixels, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

      resize = () => {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
        canvas.height = Math.max(1, Math.floor(rect.height * pixelRatio));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(ratio, canvas.width / canvas.height);
      };
      resize();
      window.addEventListener("resize", resize);
      const render = (now: number) => {
        if (!active) return;
        gl.uniform1f(time, now);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        frame = requestAnimationFrame(render);
      };
      frame = requestAnimationFrame(render);
    };

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      if (resize) window.removeEventListener("resize", resize);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      {supported ? <canvas ref={canvasRef} className="h-full w-full" /> : <img src="/feua-logo.png" alt="" className="h-full w-full object-contain" />}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float dist = distance(uv, uMouse);
    float strength = uHover * smoothstep(0.4, 0.0, dist);
    vec2 dir = uv - uMouse;
    float len = length(dir) + 0.0001;
    dir /= len;
    uv += dir * strength * 0.035 * sin(dist * 18.0 - uTime * 1.6);

    vec2 sampleUv = uv * uUvScale + uUvOffset;
    gl_FragColor = texture2D(uTexture, sampleUv);
  }
`;

/**
 * A pointer-reactive ripple on the hero photo, echoing the tableside
 * fire and the wine poured into glass -- the one place this site uses
 * WebGL, and only because a subtle liquid distortion responding to
 * the visitor's own cursor genuinely ties to that content, per the
 * build-awwwards-quality-sites skill's rule against a shader as
 * ornamental noise.
 *
 * This is strictly additive: the plain <Image> underneath (rendered
 * by the caller) is always there as the static first frame. This
 * canvas only mounts when JS runs, WebGL is available, and motion is
 * allowed -- if any of that fails, nothing below changes and the
 * plain photo is what's seen. Never the only way to see the hero.
 */
export function HeroShaderCanvas({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return; // No WebGL -- the plain <Image> underneath stands as-is.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uUvScale: { value: new THREE.Vector2(1, 1) },
      uUvOffset: { value: new THREE.Vector2(0, 0) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const texture = new THREE.TextureLoader().load(src, (tex) => {
      const imgAspect = tex.image.width / tex.image.height;
      const canvasAspect = container.clientWidth / container.clientHeight;
      // Mimic object-fit: cover by scaling/offsetting the sampled UV rect.
      if (canvasAspect > imgAspect) {
        uniforms.uUvScale.value.set(1, imgAspect / canvasAspect);
        uniforms.uUvOffset.value.set(0, (1 - imgAspect / canvasAspect) / 2);
      } else {
        uniforms.uUvScale.value.set(canvasAspect / imgAspect, 1);
        uniforms.uUvOffset.value.set((1 - canvasAspect / imgAspect) / 2, 0);
      }
    });
    uniforms.uTexture.value = texture;

    const setSize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(clientWidth, clientHeight);
    };
    setSize();

    let targetHover = 0;
    let rafId = 0;
    let running = false;
    let lastMouseMove = 0;

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMouseMove < 16) return; // throttle to ~60fps of updates
      lastMouseMove = now;
      const rect = container.getBoundingClientRect();
      uniforms.uMouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      );
      targetHover = 1;
    };
    const onPointerLeave = () => {
      targetHover = 0;
    };

    const clock = new THREE.Clock();
    const render = () => {
      if (!running) return;
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.08;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };
    const start = () => {
      if (running) return;
      running = true;
      canvas.style.opacity = "1";
      rafId = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === "visible") start();
        else stop();
      },
      { threshold: 0.01 },
    );
    io.observe(container);

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (io.takeRecords().length === 0) start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      stop();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const onResize = () => setSize();
    window.addEventListener("resize", onResize);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [src]);

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-0 transition-opacity duration-700"
        aria-hidden="true"
      />
    </div>
  );
}

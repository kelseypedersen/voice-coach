"use client";
import { useEffect } from "react";
import { initAmplitude } from "../lib/amplitude";

export default function AmplitudeProvider() {
  useEffect(() => {
    initAmplitude();
  }, []);
  return null;
}
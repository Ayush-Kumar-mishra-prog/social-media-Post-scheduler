import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { GoogleGenAI } from "@google/genai";
import { Generation } from "../model/Generation.js";
import { Post } from "../model/Post.js";
import { cloudinary } from "../config/cloudniary.js";

export const generatePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { prompt, tone } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(400).json({ message: "Api key is missing" });
      return;
    }
    const ai = new GoogleGenAI({ apiKey });

    const textResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a social media post based on the prompt: "${prompt}". Tone: ${tone}.Include relevent hashtags.
      Format the response as json with a "content" field.`,
    });
    let content = "";
    try {
      const rawText = textResponse.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const data = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { content: rawText };
      content = data.content;
    } catch (e) {
      content = textResponse.text || "";
    }

    const generation = await Generation.create({
      user: req.user._id,
      prompt,
      content,
      tone,
    });
    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};

export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const generations = await Generation.find({ user: req.user._id }).sort({
      cretedAt: -1,
    });
    res.json(generations);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};

export const getPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const post = await Post.find({ user: req.user._id });
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};

export const schedulePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { content, platforms, scheduledFor, status } = req.body;
    let parsedPlatforms = platforms;
    if (typeof parsedPlatforms === "string") {
      try {
        parsedPlatforms = JSON.parse(platforms);
      } catch (e) {
        parsedPlatforms = platforms.split(",");
      }
    }

    if (!Array.isArray(parsedPlatforms) || parsedPlatforms.length === 0) {
      res.status(400).json({ message: "Select at least one platform" });
      return;
    }

    let mediaUrl: string | undefined = req.body.mediaUrl;
    let mediaType: "image" | "video" | undefined = req.body.mediaType;
    if (req.file) {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "social-scheduler" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(req.file!.buffer);
      });
      mediaUrl = result.secure_url;
      mediaType = result.resource_type === "video" ? "video" : "image";
    }
    const post = await Post.create({
      user: req.user._id,
      content,
      platforms: parsedPlatforms,
      mediaUrl,
      mediaType,
      scheduledFor,
      status,
    });
    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server Error" });
  }
};

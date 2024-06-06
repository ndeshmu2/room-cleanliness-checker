import { Elysia, t } from "elysia";
import { cors } from '@elysiajs/cors';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ServerResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

const fileToGenerativePart = (data: string, mimeType: string) => ({
  inlineData: {
    data,
    mimeType,
  },
});

const imagesToBase64 = async (images: File[]) =>
  Promise.all(
    images.map(async (image) => {
      const arrayBuffer = await image.arrayBuffer();
      return Buffer.from(arrayBuffer).toString("base64");
    })
  );

const generateContent = async (base64Images: string[]) => {
  const prompt = "Is the room clean or messy?";
  const imageParts = base64Images.map((base64) =>
    fileToGenerativePart(base64, "image/jpeg")
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([prompt, ...imageParts]);
  return result.response.text();
};

const app = new Elysia();

app.use(cors({
  origin: true,  // Accepts all origins, adjust as needed for security
  methods: ['GET', 'POST', 'OPTIONS'],  // Allowed methods including preflight OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],  // Customizable for your needs
  credentials: true,  // Credentials are allowed
  maxAge: 5,  // Caches preflight response for 5 seconds
  preflight: true  // Automatically handle OPTIONS preflight
}));

app.post(
  "/image",
  async ({ body: { image } }) => {
    const base64Images = await imagesToBase64(image);
    const text = await generateContent(base64Images);
    const response: ServerResponse<string> = {
      status: "success",
      data: text,
    };
    return response;
  },
  {
    body: t.Object({
      image: t.Files(),
    }),
  }
)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export const companySlugs = ["open-ai", "google", "groq"] as const;

export const companies: {
  name: string;
  slug: (typeof companySlugs)[number];
  logo: string;
}[] = [
  {
    name: "Open AI",
    slug: "open-ai",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/1024px-ChatGPT-Logo.svg.png",
  },
  {
    name: "Google",
    slug: "google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png",
  },

  {
    name: "Groq",
    slug: "groq",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1A7gaDDexpewHghrUhXhUUw-RFxR4uIIbKf209FNVERmz0ov-BiEHige7skkVLzF40cA&usqp=CAU",
  },
] as const;

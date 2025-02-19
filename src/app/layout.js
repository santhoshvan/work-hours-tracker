import ChakraProviderWrapper from "./ChakraProvider";  // ✅ Correct path

export const metadata = {
  title: "Work Hours Tracker",
  description: "Track your work hours efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ChakraProviderWrapper>{children}</ChakraProviderWrapper>
      </body>
    </html>
  );
}

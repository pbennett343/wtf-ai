import "./globals.css";

export const metadata = {
    title: "WTF.AI Image Generator",
    description: "Create WTF Stats graphics automatically",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-zinc-950 text-white min-h-screen">
                {children}
            </body>
        </html>
    );
}

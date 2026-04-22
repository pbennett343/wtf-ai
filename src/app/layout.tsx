import "./globals.css";

export const metadata = {
    title: "WTF Sports — AI Stats Engine",
    description: "Create WTF Sports stats graphics automatically with AI",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen" style={{ background: '#2d2d54', color: 'white' }}>
                {children}
            </body>
        </html>
    );
}


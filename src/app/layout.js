export const metadata = {
  title: 'FestSmeden',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  )
}

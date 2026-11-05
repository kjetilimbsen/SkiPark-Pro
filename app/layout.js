export const metadata = {
  title: 'SkiPark Pro',
  description: 'Digital skipark, spennkurver og måledata',
};

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#020617' }}>
        {children}
      </body>
    </html>
  );
}

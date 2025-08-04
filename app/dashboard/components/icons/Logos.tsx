// app/dashboard/components/icons/Logos.tsx

import Image from 'next/image'; // Penting: Gunakan komponen Image dari next/image untuk optimasi

export const LogoFull = ({ className }: { className?: string }) => (
    // Asumsikan gambar logo penuh Anda ada di public/logo-full.png
    <Image
        src="/logo/logo-full.png" // Path relatif ke folder public
        alt="Dashboard Full Logo"
        width={300} // Sesuaikan dengan lebar asli gambar Anda atau lebar yang diinginkan
        height={60} // Sesuaikan dengan tinggi asli gambar Anda atau tinggi yang diinginkan
        className={className} // Menerapkan kelas Tailwind dari props
    />
);

export const LogoIcon = ({ className }: { className?: string }) => (
    // Asumsikan gambar logo ikon Anda ada di public/logo-icon.png
    <Image
        src="/logo/logo-light.png" // Path relatif ke folder public
        alt="Dashboard Icon Logo"
        width={50} // Sesuaikan dengan lebar asli gambar Anda atau lebar yang diinginkan
        height={50} // Sesuaikan dengan tinggi asli gambar Anda atau tinggi yang diinginkan
        className={className} // Menerapkan kelas Tailwind dari props
    />
);
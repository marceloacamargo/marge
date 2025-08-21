import Image from 'next/image';

interface MargeAvatarProps {
  size?: number;
  className?: string;
}

export default function MargeAvatar({ size = 40, className = "" }: MargeAvatarProps) {
  return (
    <div className={`rounded-full bg-blue-600 p-1 ${className}`}>
      <Image
        src="/marge-avatar.svg"
        alt="Marge AI Receptionist"
        width={size}
        height={size}
        className="rounded-full"
      />
    </div>
  );
}
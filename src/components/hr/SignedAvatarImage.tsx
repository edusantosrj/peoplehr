import { AvatarImage } from "@/components/ui/avatar";
import { useSignedStorageUrl } from "@/lib/storagePath";

interface Props {
  bucket: string;
  value?: string | null;
  alt?: string;
  className?: string;
}

export const SignedAvatarImage = ({ bucket, value, alt, className }: Props) => {
  const url = useSignedStorageUrl(bucket, value);
  if (!url) return null;
  return <AvatarImage src={url} alt={alt} className={className} />;
};

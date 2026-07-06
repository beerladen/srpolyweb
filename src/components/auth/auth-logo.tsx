import Image from "next/image";
import { withBasePath } from "@/lib/base-path";

export function AuthLogo() {
  return (
    <div className="flex items-center justify-start">
      <Image
        src={withBasePath("/assets/images/logo-surin-polytechnic.png")}
        alt="ตราวิทยาลัยสารพัดช่างสุรินทร์"
        width={56}
        height={56}
        className="object-contain"
      />
    </div>
  );
}

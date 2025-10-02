"use client";

import { motion } from "motion/react";
import { Home, Lock, User, Smartphone } from "lucide-react";

const icons = [
  { id: 1, Icon: Home },
  { id: 2, Icon: Lock },
  { id: 3, Icon: User },
  { id: 4, Icon: Smartphone },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-gray-900">
      <div className="flex flex-col items-center gap-12 lg:flex-row">
        {/* Left Content */}
        <div className="max-w-lg text-center lg:text-left">
          <h1 className="text-royalblue-600 mb-4 text-4xl font-extrabold">
            Hey, Welcome 👋
          </h1>
          <p className="text-lg text-gray-600">
            This is a clean and minimalist homepage built with TailwindCSS,
            Framer Motion, and lucide-react icons. The design is simple,
            adaptable, and easy to extend for your project.
          </p>
        </div>

        {/* Right Icons with circular bg */}
        <div className="relative flex h-72 w-72 items-center justify-center">
          <div className="bg-royalblue-100 absolute inset-0 rounded-full" />

          {icons.map(({ id, Icon }, index) => (
            <motion.div
              key={id}
              className="text-royalblue-600 absolute rounded-full bg-white p-4 shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: 360 }}
              transition={{
                duration: 2,
                delay: index * 0.4,
                repeat: Infinity,
                repeatType: "mirror",
              }}
              style={{
                top: `${25 + index * 10}%`,
                left: index % 2 === 0 ? "15%" : "70%",
              }}
            >
              <Icon size={28} strokeWidth={2} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { motion } from "framer-motion";

export const TestimonialsColumn = ({
    className,
    testimonials,
    duration = 10,
}) => {
    return (
        <div className={className}>
            <motion.div
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6"
            >
                {[...new Array(2)].map((_, index) => (
                    <React.Fragment key={index}>
                        {testimonials.map(({ content, name, role }, i) => (
                            <div className="p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 max-w-xs w-full" key={i}>
                                <div className="text-gray-600 dark:text-gray-300 leading-relaxed italic">"{content}"</div>
                                <div className="flex items-center gap-3 mt-6">
                                    <div
                                        aria-hidden="true"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-gradient-to-br from-primary to-orange-600 text-sm font-bold text-white shadow-sm"
                                    >
                                        {initialsFor(name)}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{name}</div>
                                        <div className="text-xs text-primary font-medium">{role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    );
};

function initialsFor(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

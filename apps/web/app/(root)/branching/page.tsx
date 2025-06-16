"use client";

import { useState, useEffect } from "react";
import { Loader2, GitBranch, CheckCircle } from "lucide-react";

const BranchingPage = () => {
  const [loadingStage, setLoadingStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingStages = [
    "Initializing branch...",
    "Checking dependencies...",
    "Setting up environment...",
    "Configuring settings...",
    "Almost ready...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStage((prev) => {
        if (prev < loadingStages.length - 1) {
          return prev + 1;
        } else {
          setIsComplete(true);
          clearInterval(interval);
          return prev;
        }
      });
    }, 1200); // Change stage every 1.2 seconds

    return () => clearInterval(interval);
  }, [loadingStages.length]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center ">
      <div className="text-center space-y-8 p-8">
        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white animate-fade-in">
            We are branching
          </h1>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <GitBranch className="h-6 w-6 animate-pulse" />
            <span className="text-lg">Creating your experience</span>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-6">
          {!isComplete ? (
            <>
              {/* Spinner */}
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
              </div>

              {/* Progress Bar */}
              <div className="w-80 mx-auto">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${((loadingStage + 1) / loadingStages.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {Math.round(
                    ((loadingStage + 1) / loadingStages.length) * 100
                  )}
                  % complete
                </div>
              </div>

              {/* Loading Stage Text */}
              <div className="h-8 flex items-center justify-center">
                <p className="text-lg text-gray-700 dark:text-gray-300 animate-pulse">
                  {loadingStages[loadingStage]}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-500 animate-bounce" />
              </div>
              <p className="text-xl text-green-600 dark:text-green-400 font-semibold animate-fade-in">
                Branch ready! Redirecting...
              </p>
            </>
          )}
        </div>

        {/* Floating Dots Animation */}
        <div className="relative h-16 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.4s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          <p>
            Please wait while we prepare your personalized experience. This may
            take a few moments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BranchingPage;

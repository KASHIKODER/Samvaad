import Lottie from "lottie-react";
import { animationDefaultOptions } from "@/lib/utils";
import { useAppStore } from "@/store";
import { RiCloseLine, RiSparklingFill, RiChatSmile3Line, RiShieldKeyholeLine, RiSmartphoneLine, RiSendPlaneFill } from "react-icons/ri";
import { useEffect, useState } from "react";

const EmptyChatContainer = () => {
  const { closeChat } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Floating particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    speed: Math.random() * 2 + 0.5,
    delay: Math.random() * 2,
  }));

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${particle.speed}s ease-in-out ${particle.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.05)_50%,transparent_75%)] bg-[length:50px_50px]"></div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Close button - Modern glass morphism */}
      <button
        onClick={closeChat}
        className={`absolute top-8 right-8 z-50 group transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
        title="Close chat"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 p-3.5 rounded-2xl group-hover:border-purple-500/50 transition-all duration-300 group-hover:scale-110">
            <RiCloseLine className="text-2xl text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          </div>
        </div>
      </button>

      {/* Main content container */}
      <div className={`relative z-10 max-w-4xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Animated header with gradient text */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-2xl bg-gray-900/40 backdrop-blur-sm border border-gray-800/50">
            <RiSparklingFill className="text-2xl text-purple-400 animate-pulse" />
            <span className="text-gray-300 text-sm font-medium">REAL-TIME MESSAGING PLATFORM</span>
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Samvaad
            </span>
          </h1>
          
          <p className="text-2xl text-gray-300/80 mb-8 font-light tracking-wide leading-relaxed max-w-3xl mx-auto">
            Where conversations flow like{" "}
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-medium">
              digital electricity
            </span>
          </p>
        </div>

        {/* Animated illustration with floating effect */}
        <div className="relative mb-16">
          <div className="relative mx-auto w-72 h-72">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
            <Lottie
              animationData={animationDefaultOptions}
              loop={true}
              autoplay={true}
              className="relative w-full h-full drop-shadow-2xl animate-float"
            />
            
            {/* Orbiting dots */}
            {[0, 120, 240].map((deg, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translateX(140px) rotate(-${deg}deg)`,
                  animation: `orbit 6s linear ${i * 2}s infinite`,
                }}
              >
                <div className="absolute inset-1 rounded-full bg-white/20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards - Glass morphism with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <RiChatSmile3Line className="text-3xl" />,
              title: "Instant Sync",
              desc: "Messages delivered in milliseconds",
              color: "from-purple-500/20 to-purple-600/20",
              hoverColor: "hover:border-purple-500/50"
            },
            {
              icon: <RiShieldKeyholeLine className="text-3xl" />,
              title: "Military Grade",
              desc: "End-to-end encrypted conversations",
              color: "from-blue-500/20 to-cyan-600/20",
              hoverColor: "hover:border-blue-500/50"
            },
            {
              icon: <RiSmartphoneLine className="text-3xl" />,
              title: "Multi-Device",
              desc: "Seamless across all platforms",
              color: "from-pink-500/20 to-rose-600/20",
              hoverColor: "hover:border-pink-500/50"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className={`group relative transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className={`relative bg-gray-900/30 backdrop-blur-xl border border-gray-800/50 ${feature.hoverColor} rounded-3xl p-8 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-purple-500/10`}>
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 mb-6">
                  <div className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Getting started - Interactive steps */}
        <div className="bg-gradient-to-br from-gray-900/40 to-gray-900/20 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20">
              <RiSendPlaneFill className="text-2xl text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white">Ready to Connect?</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Select Contact", desc: "Choose from your contact list", color: "border-purple-500/30" },
              { step: "02", title: "Start Chatting", desc: "Type your first message", color: "border-blue-500/30" },
              { step: "03", title: "Share & Enjoy", desc: "Send files, images, and more", color: "border-pink-500/30" }
            ].map((item, index) => (
              <div
                key={index}
                className={`group relative border-l-4 ${item.color} pl-6 py-4 transition-all duration-300 hover:pl-8 hover:bg-gray-800/20 rounded-r-2xl`}
              >
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-white group-hover:border-purple-500 transition-all duration-300">
                  {item.step}
                </div>
                <h4 className="text-lg font-medium text-white mb-1">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons with glow effects */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={closeChat}
            className="group relative px-8 py-4 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-100 group-hover:opacity-0 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
            <span className="relative text-white font-semibold text-lg flex items-center gap-3">
              Start Messaging
              <RiSendPlaneFill className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
          
          <button className="group relative px-8 py-4 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500 hover:scale-105 active:scale-95">
            <span className="text-gray-300 font-semibold text-lg group-hover:text-white transition-colors duration-300">
              Explore Features
            </span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </button>
        </div>

        {/* Stats footer */}
        <div className="mt-16 pt-8 border-t border-gray-800/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "50ms", label: "Latency" },
              { value: "256-bit", label: "Encryption" },
              { value: "∞", label: "Messages" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm font-medium tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(140px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
      `}</style>
    </div>
  );
};

export default EmptyChatContainer;
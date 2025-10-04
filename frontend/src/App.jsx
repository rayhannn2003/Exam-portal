import { useEffect, useState } from 'react';
import { registerStudent, loginStudent, loginAdmin } from './assets/services/api';
import Login from './components/Login';
import Registration from './components/Registration';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ToastContainer from './components/ToastContainer';
import OMRTest from './OMRTest';
import SimpleOMRTest from './SimpleOMRTest';

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Authentication states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loginUserType, setLoginUserType] = useState('student');
  const [user, setUser] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  

  const slides = [
    {
      image: '/background1.jpg',
      title: 'উপবৃত্তি পরীক্ষা -২০২৫',
      subtitle: 'শিক্ষার নতুন দিগন্ত',
      description: 'মেধাবী শিক্ষার্থীদের স্বপ্ন পূরণের পথে এগিয়ে নিয়ে যাচ্ছি আমরা। যোগ দিন আমাদের সাথে শিক্ষার এই মহান যজ্ঞে।'
    },
    {
      image: '/background2.jpg',
      title: 'সমান সুযোগের নিশ্চয়তা',
      subtitle: 'প্রতিটি শিশুর অধিকার',
      description: 'আর্থিক অবস্থা যাই হোক, মেধা ও প্রতিভা থাকলেই পাবেন উচ্চশিক্ষার সুযোগ। আমাদের বৃত্তি পরীক্ষায় অংশগ্রহণ করুন।'
    },
    {
      image: '/background3.jpg',
      title: 'ভবিষ্যতের নেতা তৈরি',
      subtitle: 'আগামীর স্বপ্নদ্রষ্টা',
      description: 'আজকের শিক্ষার্থীরাই আগামীর নেতা। তাদের শিক্ষা ও দক্ষতা বৃদ্ধিতে আমরা সর্বদা প্রতিবদ্ধ।'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isDragging]);

  // Handle scroll for logo visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    if (token && role && username) {
      setUser({ token, role, username });
      // If superadmin, show dashboard immediately
      if (role === 'superadmin') {
        setShowDashboard(true);
      }
    }
  }, []);

  // Handle user role changes
  useEffect(() => {
    if (user && user.role === 'superadmin') {
      setShowDashboard(true);
    } else if (user && user.role !== 'superadmin') {
      setShowDashboard(false);
    }
  }, [user]);

  // Authentication functions
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
    setShowDashboard(false);
    if (window.showToast) {
      window.showToast('সফলভাবে লগআউট হয়েছেন!', 'success');
    }
  };

  // Touch and mouse drag handlers
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const currentX = clientX;
    const diffX = startX - currentX;
    setTranslateX(-diffX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(translateX) > 100) {
      if (translateX < 0) {
        // Swipe right - previous slide
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else {
        // Swipe left - next slide
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }
    
    setTranslateX(0);
  };

  // Test routes for OMR functionality
  if (window.location.pathname === '/omr-test') {
    return <OMRTest />;
  }
  
  if (window.location.pathname === '/simple-omr-test') {
    return <SimpleOMRTest />;
  }

  // If user is superadmin, show dashboard
  console.log('Rendering check:', { user, isSuperadmin: user?.role === 'superadmin' });
  if (user && user.role === 'superadmin') {
    console.log('Rendering SuperAdminDashboard');
    return <SuperAdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Logo Section */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-4 transition-all duration-300 ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <img
          src="/new.svg"
          alt="Organization Logo"
          className="h-32 w-32 md:h-40 md:w-40 lg:h-32 lg:w-48 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Navigation Bar */}
      <nav className={`fixed left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-gray-700/50 transition-all duration-300 ${isScrolled ? 'top-0' : 'top-32'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" 
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন 
              </h1>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg text-lg font-medium transition-all hover:bg-white/10" 
                 style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                মূলপাতা
              </a>
              <a href="#exam" className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg text-lg font-medium transition-all hover:bg-white/10"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                পরীক্ষা
              </a>
              <a href="#about" className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg text-lg font-medium transition-all hover:bg-white/10"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                আমাদের সম্পর্কে
              </a>
              <a href="#blogs" className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg text-lg font-medium transition-all hover:bg-white/10"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                ব্লগ
              </a>
              <a href="#contact" className="text-white hover:text-yellow-300 px-4 py-2 rounded-lg text-lg font-medium transition-all hover:bg-white/10"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                যোগাযোগ
              </a>
              
              {/* Authentication Buttons */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-yellow-400 font-medium">
                    স্বাগতম, {user.username} ({user.role === 'student' ? 'ছাত্র' : 'অ্যাডমিন'})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white font-bold py-2 px-6 rounded-full transition-all hover:bg-red-600 hover:scale-105"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}
                  >
                    লগআউট
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-full transition-all hover:bg-yellow-500 hover:scale-105"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}
                  >
                    প্রবেশ
                  </button>
                
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-yellow-300 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-black/50 backdrop-blur-md border-t border-gray-700/50">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#home" className="block px-3 py-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-md text-base font-medium"
                   style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                  মূলপাতা
                </a>
                <a href="#exam" className="block px-3 py-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-md text-base font-medium"
                   style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                  পরীক্ষা
                </a>
                <a href="#about" className="block px-3 py-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-md text-base font-medium"
                   style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                  আমাদের সম্পর্কে
                </a>
                <a href="#blogs" className="block px-3 py-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-md text-base font-medium"
                   style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                  ব্লগ
                </a>
                <a href="#contact" className="block px-3 py-2 text-white hover:text-yellow-300 hover:bg-white/10 rounded-md text-base font-medium"
                   style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                  যোগাযোগ
                </a>
                
                {/* Authentication Buttons for mobile */}
                {user ? (
                  <div className="px-3 py-2">
                    <div className="text-yellow-400 font-medium mb-2">
                      স্বাগতম, {user.username} ({user.role === 'student' ? 'ছাত্র' : 'অ্যাডমিন'})
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-all hover:bg-red-600"
                      style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}
                    >
                      লগআউট
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 space-y-2">
                    <button
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded-md transition-all hover:bg-yellow-500"
                      style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}
                    >
                      প্রবেশ
                    </button>
                    <button
                      onClick={() => {
                        setIsRegistrationModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-all hover:bg-green-600"
                      style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}
                    >
                      নিবন্ধন
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Image Slider */}
      <section id="home" className="relative h-screen flex items-center justify-start overflow-hidden unselectable">
        {/* Image Slider */}
        <div 
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{
                transform: isDragging ? `translateX(${translateX}px)` : 'translateX(0)'
              }}
            >
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Overlay Content - Left Aligned */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-2xl" 
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  {slides[currentSlide].title}
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 text-yellow-200 drop-shadow-lg"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-200 leading-relaxed drop-shadow-lg max-w-2xl"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                {slides[currentSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <button className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                  <span className="mr-2">🎓</span>
                  এখনই নিবন্ধন করুন
                </button>
                <button className="group bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                  আরো জানুন
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-yellow-400 w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Bangladeshi rural education background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/80"></div>
          <div className="about-particle-container absolute inset-0"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl text-white"
                style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                পরীক্ষা ও সংস্থা সম্পর্কে
              </span>
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-8 rounded-full shadow-lg"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <p className="text-xl text-gray-200 leading-relaxed drop-shadow-lg"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                আমাদের সংস্থা স্বেচ্ছাসেবকদের নিয়ে গঠিত, যার উদ্দেশ্য শিক্ষার্থীদের উন্নতি সাধন, সুযোগ সৃষ্টি, 
                এবং অঞ্চলের উন্নয়ন। আমাদের মিশন হল সব পটভূমির মেধাবী শিক্ষার্থীদের চিহ্নিত করা এবং তাদের 
                লালন করা, যাতে প্রতিটি যোগ্য শিক্ষার্থী উৎকর্ষতার সুযোগ পায়।
              </p>
              <p className="text-xl text-yellow-200 leading-relaxed drop-shadow-lg"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ২০১৫ সাল থেকে চালু, আমরা সফলভাবে বিভিন্ন অঞ্চলে ২০,০০০+ শিক্ষার্থীর কাছে পৌঁছেছি, 
                একাডেমিক উৎকর্ষতা এবং সমাজ উন্নয়নের পথ তৈরি করেছি।
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20 animate-slide-in-right">
              <h3 className="text-3xl font-bold text-white mb-6 drop-shadow-lg"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  আমাদের মিশন
                </span>
              </h3>
              <ul className="space-y-4 text-gray-200">
                <li className="flex items-center text-lg"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  <span className="text-yellow-400 mr-3 text-2xl">✓</span>
                  একাডেমিক প্রতিভা চিহ্নিত ও লালন করা
                </li>
                <li className="flex items-center text-lg"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  <span className="text-yellow-400 mr-3 text-2xl">✓</span>
                  সবার জন্য সমান সুযোগ প্রদান
                </li>
                <li className="flex items-center text-lg"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  <span className="text-yellow-400 mr-3 text-2xl">✓</span>
                  আঞ্চলিক শিক্ষার মান উন্নয়ন
                </li>
                <li className="flex items-center text-lg"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  <span className="text-yellow-400 mr-3 text-2xl">✓</span>
                  শক্তিশালী সমাজ গঠন
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://live.staticflickr.com/7031/6642109485_bff9795e12_b.jpg"
            alt="Educational impact background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/75"></div>
          <div className="impact-particle-container absolute inset-0"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white drop-shadow-2xl"
                style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
              <span className="bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 bg-clip-text text-transparent">
                প্রভাব ও উন্নয়ন
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mb-6 mx-auto">
                <span className="text-2xl">🏅</span>
              </div>
              <div className="text-4xl font-bold mb-2 text-yellow-400 drop-shadow-lg" 
                   style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>২,০০০+</div>
              <div className="text-lg text-gray-200" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>উপকৃত শিক্ষার্থী</div>
              <div className="mt-4 text-sm text-yellow-200" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                বিভিন্ন অঞ্চল থেকে অংশগ্রহণ
              </div>
            </div>
            
            <div className="text-center bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl mb-6 mx-auto">
                <span className="text-2xl">🏫</span>
              </div>
              <div className="text-4xl font-bold mb-2 text-orange-400 drop-shadow-lg" 
                   style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>৩০+</div>
              <div className="text-lg text-gray-200" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>অন্তর্ভুক্ত স্কুল</div>
              <div className="mt-4 text-sm text-yellow-200" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                গ্রামীণ ও শহুরে উভয় এলাকায়
              </div>
            </div>
            
            <div className="text-center bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl mb-6 mx-auto">
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-4xl font-bold mb-2 text-red-400 drop-shadow-lg" 
                   style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>৫০+</div>
              <div className="text-lg text-gray-200" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>স্বেচ্ছাসেবক</div>
              <div className="mt-4 text-sm text-yellow-200" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নিবেদিত শিক্ষাবিদ ও কর্মী
              </div>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-lg p-10 rounded-3xl shadow-lg border border-white/30 mt-16 transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center mb-6">
              <div className="w-1 h-12 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full mr-6"></div>
              <blockquote className="text-xl md:text-2xl italic leading-relaxed text-gray-200 drop-shadow-lg"
                          style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                "এই পরীক্ষা আমাকে নতুন কিছু শিখিয়েছে। আমাকে নতুন প্রতিযোগিতার সম্মুখীন করে 
                আমার মেধা যাচাইয়ের সুযোগ দিয়েছে।"
              </blockquote>
            </div>
            <cite className="text-yellow-300 text-lg font-semibold flex items-center drop-shadow-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full mr-3 flex items-center justify-center text-yellow-400 text-sm">👤</div>
              নূরে আলম সিদ্দিক 
            </cite>
          </div>
        </div>
      </section>

      {/* Archive Section */}
      <section id="archive" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://steemitimages.com/p/3W72119s5BjWPGGUiZ9pqnZoj8JHYxCCp9dtn2QVeg5Hqn8gYqWvNyPRfYLzjbWsnJDZoyovDyWn6c2SBrf5MML8sX6CSD6wzCxrrPy1WGwgFpAEHrFqoU?format=match&mode=fit"
            alt="Library books background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/80"></div>
          <div className="archive-particle-container absolute inset-0"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-2xl"
                style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                আর্কাইভ ও হাইলাইটস
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full shadow-lg"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl mb-6">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  পূর্ববর্তী পরীক্ষা
                </span>
              </h3>
              <p className="text-gray-200 text-lg leading-relaxed mb-6 drop-shadow-lg"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                আমাদের পরীক্ষার আর্কাইভ ব্রাউজ করুন এবং বছরের পর বছরের বৃদ্ধি দেখুন।
              </p>
              <div className="flex items-center text-yellow-300 font-medium">
                <span className="mr-2">আরও দেখুন</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
            
            <div className="group relative bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl mb-6">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                <span className="bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 bg-clip-text text-transparent">
                  পুরস্কার বিতরণী অনুষ্ঠান
                </span>
              </h3>
              <p className="text-gray-200 text-lg leading-relaxed mb-6 drop-shadow-lg"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                উৎকর্ষতা উদযাপন এবং অসাধারণ অর্জনের স্বীকৃতি।
              </p>
              <div className="flex items-center text-yellow-300 font-medium">
                <span className="mr-2">আরও দেখুন</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
            
            <div className="group relative bg-black/40 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl mb-6">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                <span className="bg-gradient-to-r from-red-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                  সফলতার গল্প
                </span>
              </h3>
              <p className="text-gray-200 text-lg leading-relaxed mb-6 drop-shadow-lg"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                আমাদের প্রাক্তন ছাত্রদের অনুপ্রেরণামূলক যাত্রা এবং তাদের অব্যাহত সাফল্য।
              </p>
              <div className="flex items-center text-yellow-300 font-medium">
                <span className="mr-2">আরও দেখুন</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://thumbs.dreamstime.com/b/gowainghat-bangladesh-november-children-kids-enjoying-jumping-rope-game-open-green-grasses-field-teen-girls-playing-240685884.jpg"
            alt="Students studying together"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70"></div>
          <div className="cta-particle-container absolute inset-0"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img 
                src="https://www.shutterstock.com/image-photo/gowainghat-bangladesh-november-06-2019-260nw-2153471663.jpg" 
                alt="Rural school students going to school" 
                className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  গ্রামীণ এলাকার স্কুলগামী শিক্ষার্থীরা
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img 
                src="https://www.shutterstock.com/image-photo/gowainghat-bangladesh-november-06-2019-600nw-2029006799.jpg"
                alt="Rural student holding books to chest" 
                className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  বই নিয়ে অপেক্ষারত শিক্ষার্থী
                </p>
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white drop-shadow-2xl"
                style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                অংশগ্রহণের জন্য প্রস্তুত?
              </span>
            </h2>
            <p className="text-xl mb-8 text-gray-200 leading-relaxed drop-shadow-lg"
               style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              হাজার হাজার শিক্ষার্থীর সাথে উৎকর্ষতার যাত্রায় যোগ দিন
            </p>
            <button className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl mb-6"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
              <span className="mr-2">🎓</span>
              ছাত্র নিবন্ধন
            </button>
            <p className="text-yellow-200 text-lg drop-shadow-lg"
               style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              সাহায্য প্রয়োজন? <a href="#contact" className="text-yellow-300 hover:text-white hover:underline font-bold transition-colors">আমাদের হেল্পডেস্কে যোগাযোগ করুন</a>
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/cor.jpg"
            alt="Educational foundation background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/85 to-black/90"></div>
        </div>
        <div className="text-white py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-3xl font-bold mb-6 drop-shadow-lg"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  বৃত্তি পরীক্ষা
                </span>
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মানসম্পন্ন শিক্ষা এবং ন্যায্য মূল্যায়নের মাধ্যমে শিক্ষার্থীদের ক্ষমতায়ন এবং সমাজের রূপান্তর।
              </p>
            </div>
            <div>
              <h4 className="text-2xl font-semibold mb-6 text-yellow-300 drop-shadow-lg"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                দ্রুত লিঙ্ক
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#about" className="hover:text-yellow-300 transition-colors text-lg hover:drop-shadow-lg" 
                       style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>আমাদের সম্পর্কে</a></li>
                <li><a href="#exam" className="hover:text-yellow-300 transition-colors text-lg hover:drop-shadow-lg"
                       style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>পরীক্ষা</a></li>
                <li><a href="#contact" className="hover:text-yellow-300 transition-colors text-lg hover:drop-shadow-lg"
                       style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>যোগাযোগ</a></li>
                <li><a href="#login" className="hover:text-yellow-300 transition-colors text-lg hover:drop-shadow-lg"
                       style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>প্রবেশ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-2xl font-semibold mb-6 text-orange-300 drop-shadow-lg"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                যোগাযোগের তথ্য
              </h4>
              <p className="text-gray-300 mb-3 text-lg"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                📧 support@scholarshipexam.org
              </p>
              <p className="text-gray-300 mb-3 text-lg"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                📞 +৮৮০-XXX-XXXXXX
              </p>
              <p className="text-gray-300 text-lg"
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                📍 ঢাকা, বাংলাদেশ
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              &copy; ২০২৪ বৃত্তি পরীক্ষা ব্যবস্থাপনা সিস্টেম। সকল অধিকার সংরক্ষিত।
            </p>
          </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
        
        body {
          background-color: #f9fafb; /* Sets a light background for the whole page */
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .unselectable {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #d1d5db, #9ca3af);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9ca3af, #6b7280);
        }

        .animate-slide-in-left {
          animation: slideInLeft 1s ease-out;
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 1s ease-out;
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .particle-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .particle-container::before,
        .particle-container::after {
          content: "";
          position: absolute;
          background: #e5e7eb;
          border-radius: 50%;
          animation-duration: 20s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        
        .particle-container::before {
          width: 20px;
          height: 20px;
          opacity: 0.15;
          top: 10%;
          left: 10%;
          animation-name: move-up-down;
        }
        
        .particle-container::after {
          width: 30px;
          height: 30px;
          opacity: 0.12;
          bottom: 20%;
          right: 15%;
          animation-name: move-down-up;
        }

        .about-particle-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .about-particle-container::before,
        .about-particle-container::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          animation-duration: 15s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        
        .about-particle-container::before {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #10b981, #34d399);
          opacity: 0.3;
          top: 20%;
          left: 15%;
          animation-name: float-diagonal;
        }
        
        .about-particle-container::after {
          width: 25px;
          height: 25px;
          background: linear-gradient(135deg, #059669, #6ee7b7);
          opacity: 0.4;
          bottom: 30%;
          right: 20%;
          animation-name: float-reverse;
        }

        .impact-particle-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .impact-particle-container::before,
        .impact-particle-container::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          animation-duration: 18s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        
        .impact-particle-container::before {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #10b981, #14b8a6);
          opacity: 0.25;
          top: 30%;
          right: 25%;
          animation-name: impact-float;
        }
        
        .impact-particle-container::after {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #059669, #0d9488);
          opacity: 0.3;
          bottom: 25%;
          left: 30%;
          animation-name: impact-pulse;
        }

        .cta-particle-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .cta-particle-container::before,
        .cta-particle-container::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          animation-duration: 20s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        
        .cta-particle-container::before {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #34d399, #6ee7b7);
          opacity: 0.2;
          top: 15%;
          left: 10%;
          animation-name: cta-drift;
        }
        
        .cta-particle-container::after {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #14b8a6, #5eead4);
          opacity: 0.25;
          bottom: 20%;
          right: 15%;
          animation-name: cta-spin;
        }

        .archive-particle-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .archive-particle-container::before,
        .archive-particle-container::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          animation-duration: 25s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        
        .archive-particle-container::before {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          opacity: 0.15;
          top: 10%;
          right: 20%;
          animation-name: archive-glow;
        }
        
        .archive-particle-container::after {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          opacity: 0.2;
          bottom: 15%;
          left: 25%;
          animation-name: archive-float;
        }

        @keyframes float-diagonal {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(100px, -50px) rotate(90deg);
          }
          50% {
            transform: translate(200px, 50px) rotate(180deg);
          }
          75% {
            transform: translate(50px, 100px) rotate(270deg);
          }
        }
        
        @keyframes float-reverse {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-80px, -100px) scale(1.2);
          }
          66% {
            transform: translate(-150px, 50px) scale(0.8);
          }
        }
        
        @keyframes move-up-down {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(100vh);
          }
        }
        
        @keyframes move-down-up {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-100vh);
          }
        }

        @keyframes impact-float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(-50px, -30px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translate(-100px, 40px) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translate(-30px, -60px) rotate(270deg) scale(1.2);
          }
        }

        @keyframes impact-pulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.1;
          }
        }

        @keyframes cta-drift {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(80px, -60px) rotate(120deg);
          }
          66% {
            transform: translate(-40px, -120px) rotate(240deg);
          }
        }

        @keyframes cta-spin {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(1.3);
          }
          50% {
            transform: rotate(180deg) scale(0.7);
          }
          75% {
            transform: rotate(270deg) scale(1.1);
          }
        }

        @keyframes archive-glow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.15;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            transform: translate(-80px, 60px) scale(1.4);
            opacity: 0.3;
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
          }
        }

        @keyframes archive-float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(60px, -40px) rotate(90deg);
          }
          50% {
            transform: translate(-30px, -80px) rotate(180deg);
          }
          75% {
            transform: translate(-90px, 30px) rotate(270deg);
          }
      `}</style>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <Login
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={(response, userType, username) => {
            console.log('Login success callback:', { response, userType, username });
            
            // Store in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', userType);
            localStorage.setItem('username', username);
            
            const userData = { 
              token: response.token, 
              role: userType, 
              username: username 
            };
            
            console.log('Setting user data:', userData);
            setUser(userData);
            setIsLoginModalOpen(false);
            
            // Check if superadmin and show appropriate message
            if (userType === 'superadmin') {
              console.log('Superadmin detected, should show dashboard');
              if (window.showToast) {
                window.showToast('সুপার অ্যাডমিন সফলভাবে লগইন হয়েছেন! ড্যাশবোর্ডে রিডাইরেক্ট হচ্ছে...', 'success', 2000);
              }
            } else {
              if (window.showToast) {
                window.showToast(`${userType === 'student' ? 'ছাত্র' : 'অ্যাডমিন'} সফলভাবে লগইন হয়েছেন!`, 'success');
              }
            }
          }}
        />
      )}

      {/* Registration Modal */}
      {isRegistrationModalOpen && (
        <Registration
          onClose={() => setIsRegistrationModalOpen(false)}
          onSuccess={(response) => {
            setRegistrationSuccess(response);
            setIsRegistrationModalOpen(false);
            setIsSuccessModalOpen(true);
            if (window.showToast) {
              window.showToast('নিবন্ধন সফল! আপনার রোল নম্বর এবং পাসওয়ার্ড সংরক্ষণ করুন।', 'success');
            }
          }}
        />
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && registrationSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নিবন্ধন সফল!
              </h3>
              
              <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg mb-6">
                <div>
                  <span className="font-semibold text-gray-700">নাম:</span>
                  <span className="ml-2 text-gray-600">{registrationSuccess.student?.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">রোল নম্বর:</span>
                  <span className="ml-2 text-blue-600 font-bold">{registrationSuccess.student?.roll_number}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">অস্থায়ী পাসওয়ার্ড:</span>
                  <span className="ml-2 text-red-600 font-bold">{registrationSuccess.temp_password}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                অনুগ্রহ করে আপনার রোল নম্বর এবং অস্থায়ী পাসওয়ার্ড সংরক্ষণ করুন। লগইনের জন্য এগুলো প্রয়োজন হবে।
              </p>
              
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
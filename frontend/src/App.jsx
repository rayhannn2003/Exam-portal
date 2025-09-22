import { useEffect, useState } from 'react';
import { registerStudent, loginStudent, loginAdmin } from './assets/services/api';

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

  const slides = [
    {
      image: 'https://scontent.fdac181-1.fna.fbcdn.net/v/t39.30808-6/484247249_1049049640370320_1931830327377763720_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=lZjFY1e2g9oQ7kNvwHHqSsO&_nc_oc=AdnXNc5EY5yFrWgufQ0SQ0_Vzfl3rwISVETqc-YaCs-BxTTaKtJecfH-NR7dDx2kDLE&_nc_zt=23&_nc_ht=scontent.fdac181-1.fna&_nc_gid=uQmarz0IfTq4CaFLn-0UyQ&oh=00_AfZVQNemxqn0BvTwrWgcLyqcaR-PDgo0b2b4tGVN3HtoDw&oe=68D61779',
      title: 'উপবৃত্তি পরীক্ষা -২০২৫',
      subtitle: 'শিক্ষার নতুন দিগন্ত',
      description: 'মেধাবী শিক্ষার্থীদের স্বপ্ন পূরণের পথে এগিয়ে নিয়ে যাচ্ছি আমরা। যোগ দিন আমাদের সাথে শিক্ষার এই মহান যজ্ঞে।'
    },
    {
      image: 'https://scontent.fdac181-1.fna.fbcdn.net/v/t39.30808-6/481050486_1039641511311133_4883031842829511149_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=833d8c&_nc_ohc=bE0T6g-sypwQ7kNvwFLCJ6a&_nc_oc=AdnOWR1vwB8xf26EtU1FOPt6Xc7hQPP4qd1yrz6bDAHfwTLW4Bm0OFfnKXv5qzHhQNY&_nc_zt=23&_nc_ht=scontent.fdac181-1.fna&_nc_gid=_PfKRHMxldiMHzUrUHCqNg&oh=00_AfYbrphdw_LSuUyyf4PiUmH2312mXRF1PM68HpGcviXh_Q&oe=68D61C90',
      title: 'সমান সুযোগের নিশ্চয়তা',
      subtitle: 'প্রতিটি শিশুর অধিকার',
      description: 'আর্থিক অবস্থা যাই হোক, মেধা ও প্রতিভা থাকলেই পাবেন উচ্চশিক্ষার সুযোগ। আমাদের বৃত্তি পরীক্ষায় অংশগ্রহণ করুন।'
    },
    {
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
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
    }
  }, []);

  // Authentication functions
  const handleLogin = async (credentials, userType) => {
    try {
      let response;
      if (userType === 'student') {
        response = await loginStudent(credentials);
      } else {
        response = await loginAdmin(credentials);
      }
      
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', userType);
      localStorage.setItem('username', credentials.username || credentials.roll_number);
      
      setUser({ 
        token: response.token, 
        role: userType, 
        username: credentials.username || credentials.roll_number 
      });
      setIsLoginModalOpen(false);
      
      alert(`${userType === 'student' ? 'ছাত্র' : 'অ্যাডমিন'} সফলভাবে লগইন হয়েছেন!`);
    } catch (error) {
      console.error('Login error:', error);
      alert(error.error || error.message || 'লগইন ব্যর্থ হয়েছে!');
    }
  };

  const handleRegistration = async (formData) => {
    try {
      const response = await registerStudent(formData);
      setRegistrationSuccess(response);
      setIsRegistrationModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.error || error.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
    alert('সফলভাবে লগআউট হয়েছেন!');
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
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }
    
    setTranslateX(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Logo Section */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-4 transition-all duration-300 ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <img
          src="/new.svg"
          alt="Organization Logo"
          className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
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
                  <button
                    onClick={() => setIsRegistrationModalOpen(true)}
                    className="bg-green-500 text-white font-bold py-2 px-6 rounded-full transition-all hover:bg-green-600 hover:scale-105"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}
                  >
                    নিবন্ধন
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

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/80"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-4xl">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
                      style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-2 drop-shadow-lg"
                     style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {slide.subtitle}
                  </p>
                  <p className="text-lg md:text-xl mb-8 drop-shadow-lg"
                     style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {slide.description}
                  </p>
                  <button 
                    onClick={() => setIsRegistrationModalOpen(true)}
                    className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-full text-lg transition-all hover:bg-yellow-500 hover:scale-105 shadow-lg"
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    এখনই নিবন্ধন করুন
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-yellow-400 scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/80"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/40 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" 
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আমাদের সম্পর্কে
                </h2>
                <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed" 
                   style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন একটি অলাভজনক সংস্থা যা দরিদ্র ও মেধাবী শিক্ষার্থীদের শিক্ষার ক্ষেত্রে সহায়তা প্রদান করে।
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    আমাদের লক্ষ্য
                  </h3>
                  <p className="text-gray-300" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    প্রতিটি মেধাবী শিক্ষার্থীর উচ্চশিক্ষার স্বপ্ন পূরণে সহায়তা করা
                  </p>
                </div>
                
                <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    আমাদের পদ্ধতি
                  </h3>
                  <p className="text-gray-300" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    স্বচ্ছতা ও জবাবদিহিতার সাথে বৃত্তি প্রদান ও শিক্ষা সহায়তা
                  </p>
                </div>
                
                <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    আমাদের ভবিষ্যৎ
                  </h3>
                  <p className="text-gray-300" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    একটি শিক্ষিত ও দক্ষ জাতি গঠনে অবদান রাখা
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/80"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/40 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" 
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আমাদের প্রভাব
                </h2>
                <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed" 
                   style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  গত কয়েক বছরে আমাদের কার্যক্রমের মাধ্যমে অনেক শিক্ষার্থীর জীবনে ইতিবাচক পরিবর্তন এনেছি।
                </p>
              </div>
              
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl backdrop-blur-sm border border-yellow-400/30">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">১২০০+</div>
                  <div className="text-gray-300" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    সফল শিক্ষার্থী
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-green-400/30">
                  <div className="text-4xl font-bold text-green-400 mb-2">৮৫%</div>
                  <div className="text-gray-300" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    সফলতার হার
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl backdrop-blur-sm border border-blue-400/30">
                  <div className="text-4xl font-bold text-blue-400 mb-2">৫০+</div>
                  <div className="text-gray-300" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    শিক্ষা প্রতিষ্ঠান
                  </div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-purple-400/30">
                  <div className="text-4xl font-bold text-purple-400 mb-2">১০</div>
                  <div className="text-gray-300" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    বছরের অভিজ্ঞতা
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archive Section */}
      <section className="py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/80"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/40 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" 
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আর্কাইভ
                </h2>
                <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed" 
                   style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আমাদের পূর্ববর্তী পরীক্ষা ও কার্যক্রমের তথ্য এবং সফল শিক্ষার্থীদের গল্প।
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/10 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      পরীক্ষার প্রশ্নপত্র
                    </h3>
                    <p className="text-gray-300 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      বিগত বছরগুলোর পরীক্ষার প্রশ্নপত্র ও সমাধান
                    </p>
                    <button className="text-yellow-400 hover:text-yellow-300 font-medium">
                      বিস্তারিত দেখুন →
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      সফল শিক্ষার্থী
                    </h3>
                    <p className="text-gray-300 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      আমাদের সাহায্যপ্রাপ্ত সফল শিক্ষার্থীদের তালিকা
                    </p>
                    <button className="text-green-400 hover:text-green-300 font-medium">
                      বিস্তারিত দেখুন →
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      কার্যক্রমের ইতিহাস
                    </h3>
                    <p className="text-gray-300 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      আমাদের পূর্ববর্তী সকল কার্যক্রম ও অনুষ্ঠানের রেকর্ড
                    </p>
                    <button className="text-blue-400 hover:text-blue-300 font-medium">
                      বিস্তারিত দেখুন →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/80"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black/40 backdrop-blur-lg p-12 rounded-3xl shadow-2xl border border-white/20">
              <div className="relative overflow-hidden rounded-2xl mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" 
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                আজই যোগ দিন আমাদের সাথে
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed" 
                 style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                আপনার স্বপ্ন পূরণের যাত্রা শুরু করুন আজই। আমাদের বৃত্তি পরীক্ষায় অংশগ্রহণ করুন এবং 
                উচ্চশিক্ষার সুযোগ লাভ করুন।
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setIsRegistrationModalOpen(true)}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 px-8 rounded-full text-lg transition-all hover:from-yellow-500 hover:to-orange-600 hover:scale-105 shadow-xl"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  এখনই নিবন্ধন করুন
                </button>
                
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-full text-lg transition-all hover:bg-white hover:text-black hover:scale-105 shadow-xl"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  লগইন করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/90 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/new.svg" alt="Logo" className="w-12 h-12 mr-3" />
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন
                </h3>
              </div>
              <p className="text-gray-400" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শিক্ষার মাধ্যমে সমাজের কল্যাণে নিবেদিত একটি অলাভজনক সংস্থা।
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                দ্রুত লিংক
              </h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-yellow-400 transition-colors">মূলপাতা</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-yellow-400 transition-colors">আমাদের সম্পর্কে</a></li>
                <li><a href="#exam" className="text-gray-400 hover:text-yellow-400 transition-colors">পরীক্ষা</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-yellow-400 transition-colors">যোগাযোগ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                সেবাসমূহ
              </h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400">বৃত্তি প্রদান</span></li>
                <li><span className="text-gray-400">শিক্ষা সহায়তা</span></li>
                <li><span className="text-gray-400">ক্যারিয়ার গাইডেন্স</span></li>
                <li><span className="text-gray-400">মেন্টরশিপ</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                যোগাযোগ
              </h4>
              <div className="space-y-2 text-gray-400">
                <p>📍 উত্তর তারাবুনিয়া, বাংলাদেশ</p>
                <p>📞 +৮৮০ ১৭১২-৩৪৫৬৭ৈ</p>
                <p>✉️ info@uttortarabunia.org</p>
              </div>
              
              <div className="flex space-x-4 mt-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              © ২০২৫ উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন। সকল অধিকার সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                প্রবেশ করুন
              </h2>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* User Type Selection */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setLoginUserType('student')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    loginUserType === 'student'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  ছাত্র
                </button>
                <button
                  onClick={() => setLoginUserType('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    loginUserType === 'admin'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  অ্যাডমিন
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const credentials = {};
              
              if (loginUserType === 'student') {
                credentials.roll_number = formData.get('username');
                credentials.password = formData.get('password');
              } else {
                credentials.username = formData.get('username');
                credentials.password = formData.get('password');
              }
              
              handleLogin(credentials, loginUserType);
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {loginUserType === 'student' ? 'রোল নম্বর' : 'ব্যবহারকারীর নাম'}
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={loginUserType === 'student' ? 'আপনার রোল নম্বর লিখুন' : 'আপনার ব্যবহারকারীর নাম লিখুন'}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  পাসওয়ার্ড
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                প্রবেশ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ছাত্র নিবন্ধন
              </h2>
              <button
                onClick={() => setIsRegistrationModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const registrationData = {
                name: formData.get('name'),
                school: formData.get('school'),
                student_class: formData.get('student_class'),
                class_roll: formData.get('class_roll'),
                email_id: formData.get('email_id'),
                gender: formData.get('gender'),
                phone: formData.get('phone'),
                entry_fee: parseFloat(formData.get('entry_fee'))
              };
              
              handleRegistration(registrationData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    নাম *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    স্কুল/কলেজ *
                  </label>
                  <input
                    type="text"
                    name="school"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="আপনার শিক্ষা প্রতিষ্ঠানের নাম"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    শ্রেণী *
                  </label>
                  <select
                    name="student_class"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">শ্রেণী নির্বাচন করুন</option>
                    <option value="6">ষষ্ঠ</option>
                    <option value="7">সপ্তম</option>
                    <option value="8">অষ্টম</option>
                    <option value="9">নবম</option>
                    <option value="10">দশম</option>
                    <option value="11">একাদশ</option>
                    <option value="12">দ্বাদশ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ক্লাস রোল
                  </label>
                  <input
                    type="number"
                    name="class_roll"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="আপনার ক্লাস রোল"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ইমেইল
                  </label>
                  <input
                    type="email"
                    name="email_id"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="আপনার ইমেইল ঠিকানা"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    লিঙ্গ *
                  </label>
                  <select
                    name="gender"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">লিঙ্গ নির্বাচন করুন</option>
                    <option value="male">পুরুষ</option>
                    <option value="female">মহিলা</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ফোন নম্বর *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="আপনার ফোন নম্বর"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ভর্তি ফি *
                  </label>
                  <input
                    type="number"
                    name="entry_fee"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="ভর্তি ফি (টাকা)"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                নিবন্ধন সম্পূর্ণ করুন
              </button>
            </form>
          </div>
        </div>
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
    </div>
  );
}

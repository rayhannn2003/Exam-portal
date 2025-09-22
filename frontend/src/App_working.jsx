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

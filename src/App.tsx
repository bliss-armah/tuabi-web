import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  TrendingUp,
  Bell,
  Shield,
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  Linkedin,
  Twitter,
  Mail,
  Phone,
} from "lucide-react";
import mockup from "./assets/mockimage.svg";
import whatsapp from "./assets/whatsappImage.png";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { scrollY } = useScroll();

  const headerOpacity = useTransform(scrollY, [0, 100], [0.9, 1]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "services", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Formspree integration will be handled here
    alert("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#1E3A8A] poppins-bold">
                Tuabi
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {[
                { id: "hero", label: "Home" },
                { id: "about", label: "About" },
                { id: "services", label: "Services" },
                { id: "contact", label: "Contact" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`poppins-medium transition-colors duration-200 ${
                    activeSection === item.id
                      ? "text-[#1E3A8A]"
                      : "text-gray-600 hover:text-[#3B82F6]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                onClick={() => scrollToSection("contact")}
                className="bg-[#1E3A8A] text-white px-6 py-2 rounded-lg poppins-medium hover:bg-[#1E40AF] transition-colors duration-200"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-[#1E3A8A]"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden py-4 border-t border-gray-100"
            >
              <nav className="flex flex-col space-y-4">
                {[
                  { id: "hero", label: "Home" },
                  { id: "about", label: "About" },
                  { id: "services", label: "Services" },
                  { id: "contact", label: "Contact" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`poppins-medium text-left transition-colors duration-200 ${
                      activeSection === item.id
                        ? "text-[#1E3A8A]"
                        : "text-gray-600 hover:text-[#3B82F6]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => scrollToSection("contact")}
                  className="bg-[#1E3A8A] text-white px-6 py-2 rounded-lg poppins-medium hover:bg-[#1E40AF] transition-colors duration-200 w-fit"
                >
                  Get Started
                </button>
              </nav>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section
        id="hero"
        className="pt-16 min-h-screen flex items-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 right-20 w-32 h-32 bg-[#3B82F6]/10 rounded-full"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-20 left-20 w-24 h-24 bg-[#1E3A8A]/10 rounded-full"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 lg:pt-0 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 poppins-bold mb-6">
                Track Debts in Cedis.
                <span className="text-[#1E3A8A] block">Get Paid Faster.</span>
              </h1>
              <p className="text-xl text-gray-600 roboto-regular mb-8 leading-relaxed">
                Tuabi helps you keep track of who owes you, stay organized, and
                manage repayments — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => scrollToSection("contact")}
                  className="cursor-pointer bg-[#1E3A8A] text-white px-8 py-3 rounded-lg poppins-medium hover:bg-[#1E40AF] transition-colors duration-200 text-lg"
                >
                  Contact Us
                </button>
                <a
                  href="https://wa.me/233245289983"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-green-500 text-gray-900 px-8 py-3 rounded-lg poppins-medium hover:bg-indigo-100 transition-colors duration-200 text-lg flex items-center justify-center gap-2"
                >
                  <img src={whatsapp} alt="whatsapp" className="w-10 h-10" />
                  WhatsApp Us
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Dashboard Mockup */}
              {/* <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 poppins-semibold">
                    Recent Debts
                  </h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-gray-900 poppins-medium">
                        John Doe
                      </p>
                      <p className="text-sm text-gray-600 roboto-regular">
                        Lunch payment
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 poppins-bold">
                        ₵200
                      </p>
                      <p className="text-xs text-green-600 roboto-regular">
                        Paid
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900 poppins-medium">
                        Sarah Smith
                      </p>
                      <p className="text-sm text-gray-600 roboto-regular">
                        Movie tickets
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600 poppins-bold">
                        ₵45
                      </p>
                      <p className="text-xs text-yellow-600 roboto-regular">
                        Pending
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-gray-900 poppins-medium">
                        Mike Johnson
                      </p>
                      <p className="text-sm text-gray-600 roboto-regular">
                        Coffee run
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 poppins-bold">
                        ₵12
                      </p>
                      <p className="text-xs text-blue-600 roboto-regular">
                        Due Today
                      </p>
                    </div>
                  </div>
                </div>
              </div> */}

              <img src={mockup} alt="hero" className="w-full h-full" />

              {/* Floating Icons */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-[#1E3A8A] text-white p-3 rounded-full shadow-lg"
              >
                <span className="text-2xl font-bold">₵</span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <button
            onClick={() => scrollToSection("about")}
            className="text-[#1E3A8A] hover:text-[#3B82F6] transition-colors duration-200"
          >
            <ChevronDown size={32} />
          </button>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 poppins-bold mb-4">
              Why Tuabi?
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 poppins-bold mb-6">
                Managing debts can be stressful.
              </h3>
              <p className="text-lg text-gray-600 roboto-regular leading-relaxed mb-6">
                With Tuabi, you always know who owes you, how much, and when
                they'll pay — so you can focus on what matters.
              </p>
              <p className="text-lg text-gray-600 roboto-regular leading-relaxed">
                No more forgotten debts, awkward conversations, or lost
                receipts. Tuabi keeps everything organized and helps you get
                paid faster.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {[
                {
                  icon: (
                    <span className="text-3xl font-bold text-[#1E3A8A]">₵</span>
                  ),
                  title: "Track Multiple Debtors",
                  description:
                    "Keep all your debt records in one organized place",
                },
                {
                  icon: <Bell size={32} className="text-[#3B82F6]" />,
                  title: "Get Reminders",
                  description: "Never forget when payments are due",
                },
                {
                  icon: <TrendingUp size={32} className="text-[#1E3A8A]" />,
                  title: "Simple to Use",
                  description: "Intuitive interface that anyone can master",
                },
                {
                  icon: <Shield size={32} className="text-[#3B82F6]" />,
                  title: "Secure & Private",
                  description: "Your financial data is always protected",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="text-lg font-semibold text-gray-900 poppins-semibold mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 roboto-regular">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 poppins-bold mb-4">
              What You Can Do With Tuabi
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <span className="text-4xl font-bold text-[#1E3A8A]">₵</span>
                ),
                title: "Track Debts",
                description:
                  "Keep all debt records in one place with detailed information and status tracking.",
              },
              {
                icon: <Bell size={40} className="text-[#3B82F6]" />,
                title: "Set Payment Reminders",
                description:
                  "Never forget when payments are due with smart notification systems.",
              },
              {
                icon: <TrendingUp size={40} className="text-[#1E3A8A]" />,
                title: "Generate Reports",
                description:
                  "See who owes what instantly with comprehensive reporting and analytics.",
              },
              {
                icon: <Shield size={40} className="text-[#3B82F6]" />,
                title: "Simple & Secure",
                description:
                  "Your data is safe with us using enterprise-grade security measures.",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <div className="mb-6 flex justify-center">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 poppins-bold mb-4 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 roboto-regular text-center leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 poppins-bold mb-4">
              Let's Talk
            </h2>
            <p className="text-xl text-gray-600 roboto-regular">
              Ready to get started? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 poppins-bold mb-6">
                Get in Touch
              </h3>
              <p className="text-gray-600 roboto-regular mb-8 leading-relaxed">
                Have questions about Tuabi? Want to learn more about how we can
                help you manage your debts? Send us a message and we'll get back
                to you as soon as possible.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail size={20} className="text-[#1E3A8A]" />
                  <span className="text-gray-600 roboto-regular">
                    officialtuabi@gmail.com
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={20} className="text-[#1E3A8A]" />
                  <span className="text-gray-600 roboto-regular">
                    +233 (24) 528-9983
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 poppins-medium mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent roboto-regular"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 poppins-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent roboto-regular"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 poppins-medium mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent roboto-regular resize-none"
                    placeholder="Tell us about your debt management needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E3A8A] text-white py-3 px-6 rounded-lg poppins-medium hover:bg-[#1E40AF] transition-colors duration-200 text-lg"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white poppins-bold mb-4">
                Tuabi
              </h3>
              <p className="text-gray-400 roboto-regular">
                Track debts in cedis. Get paid faster.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white poppins-semibold mb-4">
                Quick Links
              </h4>
              <nav className="space-y-2">
                {[
                  { id: "hero", label: "Home" },
                  { id: "about", label: "About" },
                  { id: "services", label: "Services" },
                  { id: "contact", label: "Contact" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block text-gray-400 hover:text-white transition-colors duration-200 roboto-regular"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white poppins-semibold mb-4">
                Connect
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.linkedin.com/in/bliss-armah-nwanwah/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Linkedin size={24} />
                </a>
                <a
                  href="https://x.com/BlissAbrantie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Twitter size={24} />
                </a>
                <a
                  href="mailto:officialtuabi@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Mail size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 roboto-regular">
              © {new Date().getFullYear()} Tuabi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/0245289983"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200 z-40"
      >
        <MessageCircle size={24} />
      </motion.a>
    </div>
  );
}

export default App;

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GraduationCap, Globe, ArrowRight, CheckCircle2, BookOpen, Users, ShieldCheck } from "lucide-react";

type Lang = "en" | "fr" | "ar";

const content = {
  en: {
    title: "PFE Management Platform",
    subtitle: "Faculty Polydisciplinary of Taroudant",
    heroTitle: "Streamline Your End-of-Studies Project",
    heroDesc: "A comprehensive platform designed for FPT students, coordinators, and administrators to manage PFE projects efficiently from team formation to final defense.",
    getStarted: "Get Started",
    login: "Login",
    whyTitle: "Why use this platform?",
    why1: "Centralized Management",
    why1Desc: "All your project documents, team details, and communications in one place.",
    why2: "Real-time Tracking",
    why2Desc: "Track your progress and get instant feedback from coordinators.",
    why3: "Secure & Reliable",
    why3Desc: "Built with modern security standards to protect your academic data.",
    howTitle: "How it works",
    how1: "Create an Account",
    how1Desc: "Register as a team leader using your FPT email.",
    how2: "Form Your Team",
    how2Desc: "Add your team members and submit your project proposal.",
    how3: "Get Approved",
    how3Desc: "Coordinators review and approve your team and subject.",
    footer: "© 2024 Faculty Polydisciplinary of Taroudant. All rights reserved."
  },
  fr: {
    title: "Plateforme de Gestion des PFE",
    subtitle: "Faculté Polydisciplinaire de Taroudant",
    heroTitle: "Simplifiez votre Projet de Fin d'Études",
    heroDesc: "Une plateforme complète conçue pour les étudiants, coordinateurs et administrateurs de la FPT afin de gérer efficacement les projets PFE, de la formation des équipes à la soutenance finale.",
    getStarted: "Commencer",
    login: "Se connecter",
    whyTitle: "Pourquoi utiliser cette plateforme ?",
    why1: "Gestion Centralisée",
    why1Desc: "Tous vos documents de projet, détails d'équipe et communications au même endroit.",
    why2: "Suivi en Temps Réel",
    why2Desc: "Suivez vos progrès et obtenez des retours instantanés des coordinateurs.",
    why3: "Sécurisé et Fiable",
    why3Desc: "Construit avec des normes de sécurité modernes pour protéger vos données académiques.",
    howTitle: "Comment ça marche",
    how1: "Créer un Compte",
    how1Desc: "Inscrivez-vous en tant que chef d'équipe avec votre email FPT.",
    how2: "Former votre Équipe",
    how2Desc: "Ajoutez les membres de votre équipe et soumettez votre proposition de projet.",
    how3: "Obtenir l'Approbation",
    how3Desc: "Les coordinateurs examinent et approuvent votre équipe et votre sujet.",
    footer: "© 2024 Faculté Polydisciplinaire de Taroudant. Tous droits réservés."
  },
  ar: {
    title: "منصة إدارة مشاريع التخرج",
    subtitle: "الكلية متعددة التخصصات بتارودانت",
    heroTitle: "بسط مشروع تخرجك",
    heroDesc: "منصة شاملة مصممة لطلاب ومنسقي وإداريي الكلية متعددة التخصصات بتارودانت لإدارة مشاريع التخرج بكفاءة من تكوين الفرق إلى المناقشة النهائية.",
    getStarted: "ابدأ الآن",
    login: "تسجيل الدخول",
    whyTitle: "لماذا تستخدم هذه المنصة؟",
    why1: "إدارة مركزية",
    why1Desc: "جميع مستندات مشروعك وتفاصيل فريقك واتصالاتك في مكان واحد.",
    why2: "تتبع في الوقت الفعلي",
    why2Desc: "تتبع تقدمك واحصل على ملاحظات فورية من المنسقين.",
    why3: "آمن وموثوق",
    why3Desc: "مبني بمعايير أمان حديثة لحماية بياناتك الأكاديمية.",
    howTitle: "كيف تعمل",
    how1: "إنشاء حساب",
    how1Desc: "سجل كقائد فريق باستخدام بريدك الإلكتروني الجامعي.",
    how2: "تكوين فريقك",
    how2Desc: "أضف أعضاء فريقك وقدم مقترح مشروعك.",
    how3: "الحصول على الموافقة",
    how3Desc: "يقوم المنسقون بمراجعة والموافقة على فريقك وموضوعك.",
    footer: "© 2024 الكلية متعددة التخصصات بتارودانت. جميع الحقوق محفوظة."
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = content[lang];
  const isRtl = lang === "ar";

  return (
    <div className={`min-h-screen bg-slate-50 font-sans ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Image src="/fpt-logo.png" alt="FPT Logo" width={150} height={48} className="h-12 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <Globe className="w-4 h-4 text-slate-500 ml-2" />
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as Lang)}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              <Link href="/login">
                <Button variant="outline" className="hidden sm:flex border-fpt-blue text-fpt-blue hover:bg-fpt-blue hover:text-white transition-colors">
                  {t.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-fpt-green hover:bg-fpt-green/90 text-white shadow-lg shadow-fpt-green/30">
                  {t.getStarted}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-fpt-blue/5 to-fpt-green/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fpt-blue via-transparent to-transparent blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fpt-blue/10 text-fpt-blue text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fpt-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fpt-blue"></span>
              </span>
              {t.subtitle}
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              {t.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-fpt-blue hover:bg-fpt-blue/90 text-white h-14 px-8 text-lg shadow-xl shadow-fpt-blue/20 group">
                  {t.getStarted}
                  <ArrowRight className={`w-5 h-5 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'} group-hover:${isRtl ? '-translate-x-1' : 'translate-x-1'} transition-transform`} />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-slate-300 hover:bg-slate-50">
                  {t.login}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Why Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">{t.whyTitle}</h2>
            <div className="w-20 h-1 bg-fpt-green mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-fpt-blue/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-fpt-blue/10 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-fpt-blue" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t.why1}</h3>
              <p className="text-slate-600">{t.why1Desc}</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-fpt-green/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-fpt-green/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-fpt-green" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t.why2}</h3>
              <p className="text-slate-600">{t.why2Desc}</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-fpt-blue/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-fpt-blue/10 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-fpt-blue" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t.why3}</h3>
              <p className="text-slate-600">{t.why3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">{t.howTitle}</h2>
            <div className="w-20 h-1 bg-fpt-green mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-slate-700 z-0" />
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-fpt-blue rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-fpt-blue/30 border-4 border-slate-900">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">{t.how1}</h3>
              <p className="text-slate-400">{t.how1Desc}</p>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-fpt-green rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-fpt-green/30 border-4 border-slate-900">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">{t.how2}</h3>
              <p className="text-slate-400">{t.how2Desc}</p>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-fpt-blue rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-fpt-blue/30 border-4 border-slate-900">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">{t.how3}</h3>
              <p className="text-slate-400">{t.how3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-fpt-green" />
            <span className="font-bold text-white">FPT Platform</span>
          </div>
          <p className="text-slate-500 text-sm">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}

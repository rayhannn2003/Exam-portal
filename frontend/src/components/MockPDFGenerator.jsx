import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const MockPDFGenerator = ({ examId, setId, examTitle, setName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();

  // Generate 60 Bengali MCQ questions
  const generateBengaliQuestions = () => {
    const bengaliQuestions = [
      { qno: 1, question: "বাংলাদেশের রাজধানীর নাম কি?", options: { "A": "ঢাকা", "B": "কুমিল্লা", "C": "রংপুর", "D": "রাজশাহী" } },
      { qno: 2, question: "বাংলাদেশের জাতীয় ফুল কোনটি?", options: { "A": "গোলাপ", "B": "শাপলা", "C": "জবা", "D": "বেলি" } },
      { qno: 3, question: "রবীন্দ্রনাথ ঠাকুর কোন সালে নোবেল পুরস্কার পেয়েছিলেন?", options: { "A": "১৯১২", "B": "১৯১৩", "C": "১৯১৪", "D": "১৯১৫" } },
      { qno: 4, question: "বাংলাদেশের মুক্তিযুদ্ধ কত সালে হয়েছিল?", options: { "A": "১৯৭০", "B": "১৯৭১", "C": "১৯৭২", "D": "১৯৭৩" } },
      { qno: 5, question: "বাংলাদেশের সবচেয়ে বড় নদী কোনটি?", options: { "A": "পদ্মা", "B": "মেঘনা", "C": "যমুনা", "D": "কর্ণফুলী" } },
      { qno: 6, question: "'আমার সোনার বাংলা' গানটি কে লিখেছেন?", options: { "A": "কাজী নজরুল ইসলাম", "B": "রবীন্দ্রনাথ ঠাকুর", "C": "জসীমউদ্দীন", "D": "সুকান্ত ভট্টাচার্য" } },
      { qno: 7, question: "বাংলাদেশের প্রথম রাষ্ট্রপতি কে ছিলেন?", options: { "A": "শেখ মুজিবুর রহমান", "B": "জিয়াউর রহমান", "C": "আবু সাইদ চৌধুরী", "D": "বিচারপতি সায়েম" } },
      { qno: 8, question: "ঢাকা বিশ্ববিদ্যালয় প্রতিষ্ঠিত হয় কোন সালে?", options: { "A": "১৯২০", "B": "১৯২১", "C": "১৯২২", "D": "১৯২৩" } },
      { qno: 9, question: "বাংলাদেশের জাতীয় পাখি কোনটি?", options: { "A": "দোয়েল", "B": "কাক", "C": "শালিক", "D": "বুলবুলি" } },
      { qno: 10, question: "'পদ্মা নদীর মাঝি' উপন্যাসটি কার লেখা?", options: { "A": "মানিক বন্দ্যোপাধ্যায়", "B": "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "C": "তারাশঙ্কর বন্দ্যোপাধ্যায়", "D": "শরৎচন্দ্র চট্টোপাধ্যায়" } },
      { qno: 11, question: "বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গের নাম কি?", options: { "A": "কেওক্রাডং", "B": "তাজিংডং", "C": "সাকা হাফং", "D": "রাঙামাটি পাহাড়" } },
      { qno: 12, question: "কোন দেশের সাথে বাংলাদেশের সবচেয়ে বেশি সীমানা?", options: { "A": "ভারত", "B": "মিয়ানমার", "C": "নেপাল", "D": "ভুটান" } },
      { qno: 13, question: "বঙ্গবন্ধু শেখ মুজিবুর রহমান কোন সালে জন্মগ্রহণ করেছিলেন?", options: { "A": "১৯১৯", "B": "১৯২০", "C": "১৯২১", "D": "১৯২২" } },
      { qno: 14, question: "বাংলা একাডেমি প্রতিষ্ঠিত হয় কোন সালে?", options: { "A": "১৯৫৪", "B": "১৯৫৫", "C": "১৯৫৬", "D": "১৯৫৭" } },
      { qno: 15, question: "বাংলাদেশের জাতীয় গাছ কোনটি?", options: { "A": "আম", "B": "কাঁঠাল", "C": "নারকেল", "D": "বট" } },
      { qno: 16, question: "'লালসালু' উপন্যাসের লেখক কে?", options: { "A": "সৈয়দ ওয়ালীউল্লাহ", "B": "আবু ইসহাক", "C": "আল মাহমুদ", "D": "হুমায়ূন আহমেদ" } },
      { qno: 17, question: "বাংলাদেশের কোন বিভাগে সবচেয়ে বেশি জেলা রয়েছে?", options: { "A": "ঢাকা", "B": "চট্টগ্রাম", "C": "রাজশাহী", "D": "খুলনা" } },
      { qno: 18, question: "মুক্তিযুদ্ধের সময় বাংলাদেশ কয়টি সেক্টরে বিভক্ত ছিল?", options: { "A": "৯টি", "B": "১০টি", "C": "১১টি", "D": "১২টি" } },
      { qno: 19, question: "বাংলাদেশের জাতীয় মসজিদের নাম কি?", options: { "A": "বায়তুল মোকাররম", "B": "তারা মসজিদ", "C": "ষাট গম্বুজ মসজিদ", "D": "কুসুম্বা মসজিদ" } },
      { qno: 20, question: "কাজী নজরুল ইসলাম কোন উপাধি পেয়েছিলেন?", options: { "A": "বিদ্রোহী কবি", "B": "জাতীয় কবি", "C": "কবি প্রেমিক", "D": "সব কয়টি" } },
      { qno: 21, question: "বাংলাদেশের প্রাচীনতম শহর কোনটি?", options: { "A": "পুন্ড্রনগর", "B": "সোনারগাঁও", "C": "ঢাকা", "D": "কুমিল্লা" } },
      { qno: 22, question: "সুন্দরবনের আয়তন কত বর্গকিলোমিটার?", options: { "A": "৬০১৭", "B": "৬০১৮", "C": "৬০১৯", "D": "৬০২০" } },
      { qno: 23, question: "বাংলাদেশের কোন নদী 'পুরাতন ব্রহ্মপুত্র' নামে পরিচিত?", options: { "A": "তিস্তা", "B": "করতোয়া", "C": "আত্রাই", "D": "যমুনা" } },
      { qno: 24, question: "'গোরা' উপন্যাসটি কার লেখা?", options: { "A": "রবীন্দ্রনাথ ঠাকুর", "B": "বঙ্কিমচন্দ্র চট্টোপাধ্যায়", "C": "শরৎচন্দ্র চট্টোপাধ্যায়", "D": "ঈশ্বরচন্দ্র বিদ্যাসাগর" } },
      { qno: 25, question: "বাংলাদেশের একমাত্র কয়লাখনি কোথায় অবস্থিত?", options: { "A": "দিনাজপুর", "B": "বরিশাল", "C": "বগুড়া", "D": "রাজশাহী" } },
      { qno: 26, question: "পদ্মা সেতুর দৈর্ঘ্য কত কিলোমিটার?", options: { "A": "৬.১৫", "B": "৬.২৫", "C": "৬.৩৫", "D": "৬.৪৫" } },
      { qno: 27, question: "বাংলাদেশের প্রথম সংবিধান কবে গৃহীত হয়?", options: { "A": "১৬ ডিসেম্বর ১৯৭২", "B": "৪ নভেম্বর ১৯৭২", "C": "২৬ মার্চ ১৯৭৩", "D": "১৬ ডিসেম্বর ১৯৭৩" } },
      { qno: 28, question: "বাংলাদেশের জাতীয় দিবস কোনটি?", options: { "A": "২১ ফেব্রুয়ারি", "B": "২৬ মার্চ", "C": "১৬ ডিসেম্বর", "D": "১৪ এপ্রিল" } },
      { qno: 29, question: "'দুর্গেশনন্দিনী' উপন্যাসের লেখক কে?", options: { "A": "মাইকেল মধুসূদন দত্ত", "B": "বঙ্কিমচন্দ্র চট্টোপাধ্যায়", "C": "ঈশ্বরচন্দ্র বিদ্যাসাগর", "D": "প্যারীচাঁদ মিত্র" } },
      { qno: 30, question: "বাংলাদেশের বৃহত্তম দ্বীপ কোনটি?", options: { "A": "সেন্টমার্টিন", "B": "ভোলা", "C": "হাতিয়া", "D": "মহেশখালী" } },
      { qno: 31, question: "বাংলা ভাষার প্রথম মহাকাব্য কোনটি?", options: { "A": "মেঘনাদবধ কাব্য", "B": "চর্যাপদ", "C": "শ্রীকৃষ্ণকীর্তন", "D": "অন্নদামঙ্গল" } },
      { qno: 32, question: "বাংলাদেশের সবচেয়ে বড় হাওর কোনটি?", options: { "A": "হাকালুকি হাওর", "B": "টাঙ্গুয়ার হাওর", "C": "কাওয়াদিঘী হাওর", "D": "চলনবিল" } },
      { qno: 33, question: "রাজশাহী বিশ্ববিদ্যালয় প্রতিষ্ঠিত হয় কোন সালে?", options: { "A": "১৯৫২", "B": "১৯৫৩", "C": "১৯৫৪", "D": "১৯৫৫" } },
      { qno: 34, question: "'আরণ্যক' উপন্যাসটি কার লেখা?", options: { "A": "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "B": "তারাশঙ্কর বন্দ্যোপাধ্যায়", "C": "মানিক বন্দ্যোপাধ্যায়", "D": "সতীনাথ ভাদুড়ী" } },
      { qno: 35, question: "বাংলাদেশের কয়টি বিভাগ রয়েছে?", options: { "A": "৬টি", "B": "৭টি", "C": "৮টি", "D": "৯টি" } },
      { qno: 36, question: "বাংলাদেশের জাতীয় খেলা কি?", options: { "A": "ফুটবল", "B": "ক্রিকেট", "C": "হাডুডু", "D": "ভলিবল" } },
      { qno: 37, question: "'রূপসী বাংলা' কাব্যগ্রন্থের রচয়িতা কে?", options: { "A": "জীবনানন্দ দাশ", "B": "রবীন্দ্রনাথ ঠাকুর", "C": "কাজী নজরুল ইসলাম", "D": "সুধীন্দ্রনাথ দত্ত" } },
      { qno: 38, question: "বাংলাদেশের সবচেয়ে বড় জেলা কোনটি?", options: { "A": "রাঙ্গামাটি", "B": "বান্দরবান", "C": "খাগড়াছড়ি", "D": "সিলেট" } },
      { qno: 39, question: "ঢাকার পুরাতন নাম কি ছিল?", options: { "A": "জাহাঙ্গীরনগর", "B": "সোনারগাঁও", "C": "বিক্রমপুর", "D": "দেবগিরি" } },
      { qno: 40, question: "'নীল দর্পণ' নাটকের রচয়িতা কে?", options: { "A": "দীনবন্ধু মিত্র", "B": "মাইকেল মধুসূদন দত্ত", "C": "গিরিশচন্দ্র ঘোষ", "D": "রবীন্দ্রনাথ ঠাকুর" } },
      { qno: 41, question: "বাংলাদেশের সর্ববৃহৎ বন কোনটি?", options: { "A": "সুন্দরবন", "B": "পার্বত্য বন", "C": "শালবন", "D": "গজারি বন" } },
      { qno: 42, question: "স্বাধীনতা যুদ্ধে বীরশ্রেষ্ঠ কতজন?", options: { "A": "৬ জন", "B": "৭ জন", "C": "৮ জন", "D": "৯ জন" } },
      { qno: 43, question: "বাংলাদেশের প্রথম প্রধানমন্ত্রী কে ছিলেন?", options: { "A": "তাজউদ্দীন আহমদ", "B": "শেখ মুজিবুর রহমান", "C": "খন্দকার মোশতাক আহমদ", "D": "এ এইচ এম কামারুজ্জামান" } },
      { qno: 44, question: "'বিষাদ সিন্ধু' কাব্যের রচয়িতা কে?", options: { "A": "মীর মশাররফ হোসেন", "B": "কায়কোবাদ", "C": "মোজাম্মেল হক", "D": "এয়াকুব আলী চৌধুরী" } },
      { qno: 45, question: "বাংলাদেশের একমাত্র প্রবাল দ্বীপ কোনটি?", options: { "A": "সেন্টমার্টিন", "B": "নিঝুম দ্বীপ", "C": "ভোলা", "D": "মহেশখালী" } },
      { qno: 46, question: "কত তারিখে বাংলাদেশের স্বাধীনতা ঘোষণা করা হয়?", options: { "A": "২৫ মার্চ", "B": "২৬ মার্চ", "C": "২৭ মার্চ", "D": "১৬ ডিসেম্বর" } },
      { qno: 47, question: "'চাঁদের পাহাড়' উপন্যাসের লেখক কে?", options: { "A": "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "B": "শরৎচন্দ্র চট্টোপাধ্যায়", "C": "মানিক বন্দ্যোপাধ্যায়", "D": "তারাশঙ্কর বন্দ্যোপাধ্যায়" } },
      { qno: 48, question: "বাংলাদেশে মোট কয়টি জেলা আছে?", options: { "A": "৬২টি", "B": "৬৩টি", "C": "৬৪টি", "D": "৬৫টি" } },
      { qno: 49, question: "বাংলাদেশের প্রথম উপগ্রহের নাম কি?", options: { "A": "বঙ্গবন্ধু স্যাটেলাইট-১", "B": "বাংলাদেশ-১", "C": "ঢাকা স্যাটেলাইট", "D": "পদ্মা-১" } },
      { qno: 50, question: "'কৃষ্ণকান্তের উইল' উপন্যাসটি কার লেখা?", options: { "A": "বঙ্কিমচন্দ্র চট্টোপাধ্যায়", "B": "রবীন্দ্রনাথ ঠাকুর", "C": "শরৎচন্দ্র চট্টোপাধ্যায়", "D": "প্রেমেন্দ্র মিত্র" } },
      { qno: 51, question: "বাংলাদেশের সবচেয়ে ছোট জেলা কোনটি?", options: { "A": "মেহেরপুর", "B": "নারায়ণগঞ্জ", "C": "মাদারীপুর", "D": "শরীয়তপুর" } },
      { qno: 52, question: "মুজিবনগর সরকার কোথায় গঠিত হয়েছিল?", options: { "A": "কুষ্টিয়া", "B": "মেহেরপুর", "C": "যশোর", "D": "ফরিদপুর" } },
      { qno: 53, question: "'গীতাঞ্জলি' কাব্যগ্রন্থ কত সালে প্রকাশিত হয়?", options: { "A": "১৯০৯", "B": "১৯১০", "C": "১৯১১", "D": "১৯১২" } },
      { qno: 54, question: "বাংলাদেশের জাতীয় বীজ কোনটি?", options: { "A": "ধান", "B": "পাট", "C": "গম", "D": "ইক্ষু" } },
      { qno: 55, question: "কোন নদীর তীরে ঢাকা শহর অবস্থিত?", options: { "A": "বুড়িগঙ্গা", "B": "পদ্মা", "C": "যমুনা", "D": "মেঘনা" } },
      { qno: 56, question: "'আলালের ঘরের দুলাল' উপন্যাসের রচয়িতা কে?", options: { "A": "প্যারীচাঁদ মিত্র", "B": "তেকচাঁদ ঠাকুর", "C": "কালীপ্রসন্ন সিংহ", "D": "ঈশ্বরচন্দ্র বিদ্যাসাগর" } },
      { qno: 57, question: "বাংলাদেশের প্রথম পারমাণবিক বিদ্যুৎ কেন্দ্র কোথায়?", options: { "A": "পাবনা", "B": "রূপপুর", "C": "রাজশাহী", "D": "কুমিল্লা" } },
      { qno: 58, question: "'দেবদাস' উপন্যাসের লেখক কে?", options: { "A": "শরৎচন্দ্র চট্টোপাধ্যায়", "B": "রবীন্দ্রনাথ ঠাকুর", "C": "বিভূতিভূষণ বন্দ্যোপাধ্যায়", "D": "তারাশঙ্কর বন্দ্যোপাধ্যায়" } },
      { qno: 59, question: "বাংলাদেশে প্রথম সাধারণ নির্বাচন কবে অনুষ্ঠিত হয়?", options: { "A": "১৯৭৩", "B": "১৯৭৪", "C": "১৯৭৫", "D": "১৯৭৬" } },
      { qno: 60, question: "'অগ্নিবীণা' কাব্যগ্রন্থের রচয়িতা কে?", options: { "A": "কাজী নজরুল ইসলাম", "B": "রবীন্দ্রনাথ ঠাকুর", "C": "জীবনানন্দ দাশ", "D": "সুকান্ত ভট্টাচার্য" } }
    ];

    return bengaliQuestions;
  };

  const generateMockExamData = () => {
    return {
      exam: {
        title: examTitle || 'মেধাবৃত্তী পরীক্ষা -২০২৫',
        organization: 'উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন',
        class_name: 'নবম শ্রেণী',
        year: 2025,
        question_count: 60
      },
      exam_set: {
        set_name: setName || 'সেট - A',
        questions: generateBengaliQuestions(),
        answer_key: {},
        total_marks: 60,
        duration_minutes: 60 // 1 hour for 60 questions
      }
    };
  };

  const generateHTMLContent = () => {
    const examData = generateMockExamData();
    const { exam, exam_set } = examData;

    // Split questions into two pages
    const firstPageQuestions = exam_set.questions.slice(0, 26);
    const secondPageQuestions = exam_set.questions.slice(26, 60);

    return `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${exam.title} - ${exam_set.set_name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');
        
        @media print {
            body {
                font-family: 'Noto Sans Bengali', 'Times New Roman', serif;
                font-size: 11pt;
                line-height: 1.3;
                color: #000;
                background: white;
                margin: 0;
                padding: 0;
            }
            
            .page-break {
                page-break-before: always;
            }
            
            .question {
                page-break-inside: avoid;
                margin-bottom: 8px;
            }
        }
        
        @page {
            size: A4;
            margin: 1.2in 0.8in 0.8in 1.2in;
        }
        
        body {
            font-family: 'Noto Sans Bengali', Arial, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .page {
            min-height: 100vh;
            padding: 15px 20px 15px 10px;
            box-sizing: border-box;
            max-width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #333;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .organization {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .exam-title {
            font-size: 20px;
            font-weight: 600;
            margin: 5px 0;
        }
        
        .class-name {
            font-size: 16px;
            font-weight: 500;
            margin: 5px 0;
        }
        
        .set-info {
            font-size: 16px;
            margin: 5px 0;
        }
        
        .exam-meta {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            font-size: 16px;
            font-weight: 500;
        }
        
        .questions-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
            max-width: 100%;
            justify-content: center;
            padding-left: 100px;
      
        }
        
        .question-column {
            display: flex;
            flex-direction: column;
            gap: 18px;
            max-width: 45%;
        }
        
        .question-column:last-child {
            margin-left: 10px;
        }
        
        .question {
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
            padding: 8px;
            border-radius: 4px;
            background: #fafafa;
        }
        
        .question-text {
            margin-bottom: 6px;
            font-size: 20px;
            line-height: 1.4;
            font-weight: 500;
            color: #2c3e50;
        }
        
        .options {
            display: flex;
            flex-direction: column;
            gap: 3px;
            margin-top: 5px;
        }
        
        .option {
            font-size: 20px;
            display: flex;
            align-items: flex-start;
            margin-bottom: 2px;
        }
        
        .option-key {
            font-weight: 600;
            margin-right: 8px;
            min-width: 20px;
        }
        
        .option-text {
            flex: 1;
            line-height: 1.3;
        }
        
        .guidelines {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 20px;
            margin: 25px auto 25px 30px;
            border-radius: 8px;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .guidelines h3 {
            margin-bottom: 15px;
            color: #495057;
            font-size: 18px;
            font-weight: 600;
        }
        
        .guidelines ol {
            margin: 0;
            padding-left: 0;
            list-style: none;
            text-align: left;
            display: inline-block;
        }
        
        .guidelines li {
            margin: 8px 0;
            font-size: 14px;
            line-height: 1.5;
            position: relative;
            padding-left: 25px;
        }
        
        .guidelines li:before {
            content: counter(guideline-counter);
            counter-increment: guideline-counter;
            position: absolute;
            left: 0;
            top: 0;
            background: #007bff;
            color: white;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        .guidelines ol {
            counter-reset: guideline-counter;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .footer {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 9px;
            color: #666;
        }
    </style>
</head>
<body>
    <!-- First Page -->
    <div class="page">
        <div class="header">
            <div class="organization">${exam.organization}</div>
            <div class="exam-title">${exam.title}</div>
            <div class="class-name">${exam.class_name}</div>
            <div class="set-info">${exam_set.set_name}</div>
        </div>
        
        <div class="exam-meta">
            <span>পূর্ণমান: ${exam_set.total_marks}</span>
            <span>সময়: ${exam_set.duration_minutes} মিনিট</span>
        </div>
        
        <!-- Guidelines Section -->
        <div class="guidelines">
            <h3>সাধারণ নির্দেশনা</h3>
            <ol>
                <li>সকল প্রশ্নের উত্তর দিতে হবে</li>
                <li>প্রতিটি প্রশ্নের মান ১ নম্বর</li>
                <li>সঠিক উত্তরটি বেছে নিন</li>
                <li>শুধুমাত্র নীল বা কালো কালি ব্যবহার করুন</li>
                <li>সময়ের সদ্ব্যবহার করুন - আপনার সময় ${exam_set.duration_minutes} মিনিট</li>
                <li>জমা দেওয়ার আগে উত্তরগুলি পরীক্ষা করুন</li>
            </ol>
        </div>
        
        <div class="questions-container">
            <div class="question-column">
                ${firstPageQuestions.slice(0, 13).map(question => `
                    <div class="question">
                        <div class="question-text">${question.qno}. ${question.question}</div>
                        <div class="options">
                            <div class="option">
                                <span class="option-key">(A)</span>
                                <span class="option-text">${question.options.A}</span>
                            </div>
                            <div class="option">
                                <span class="option-key">(B)</span>
                                <span class="option-text">${question.options.B}</span>
                            </div>
                            <div class="option">
                                <span class="option-key">(C)</span>
                                <span class="option-text">${question.options.C}</span>
                            </div>
                            <div class="option">
                                <span class="option-key">(D)</span>
                                <span class="option-text">${question.options.D}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="question-column">
                ${firstPageQuestions.slice(13, 26).map(question => `
                    <div class="question">
                        <div class="question-text">${question.qno}. ${question.question}</div>
                        <div class="options">
                            <div class="option">
                                <span class="option-key">(A)</span>
                                <span class="option-text">${question.options.A}</span>
                            </div>
                            <div class="option">
                                <span class="option-key">(B)</span>
                                <span class="option-text">${question.options.B}</span>
                            </div>
                            <div class="option">
                                <span class="option-key">(C)</span>
                                <span class="option-text">${question.options.C}</span>
                            </div>
                            <div class="option">
                                <span class="option-key">(D)</span>
                                <span class="option-text">${question.options.D}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    
    <!-- Second Page -->
    <div class="page-break">
        <div class="page">
            <div class="questions-container">
                <div class="question-column">
                    ${secondPageQuestions.slice(0, 17).map(question => `
                        <div class="question">
                            <div class="question-text">${question.qno}. ${question.question}</div>
                            <div class="options">
                                <div class="option">
                                    <span class="option-key">(A)</span>
                                    <span class="option-text">${question.options.A}</span>
                                </div>
                                <div class="option">
                                    <span class="option-key">(B)</span>
                                    <span class="option-text">${question.options.B}</span>
                                </div>
                                <div class="option">
                                    <span class="option-key">(C)</span>
                                    <span class="option-text">${question.options.C}</span>
                                </div>
                                <div class="option">
                                    <span class="option-key">(D)</span>
                                    <span class="option-text">${question.options.D}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="question-column">
                    ${secondPageQuestions.slice(17, 34).map(question => `
                        <div class="question">
                            <div class="question-text">${question.qno}. ${question.question}</div>
                            <div class="options">
                                <div class="option">
                                    <span class="option-key">(A)</span>
                                    <span class="option-text">${question.options.A}</span>
                                </div>
                                <div class="option">
                                    <span class="option-key">(B)</span>
                                    <span class="option-text">${question.options.B}</span>
                                </div>
                                <div class="option">
                                    <span class="option-key">(C)</span>
                                    <span class="option-text">${question.options.C}</span>
                                </div>
                                <div class="option">
                                    <span class="option-key">(D)</span>
                                    <span class="option-text">${question.options.D}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>Generated: ${new Date().toLocaleString('bn-BD')}</p>
    </div>
</body>
</html>`;
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const examData = generateMockExamData();
      
      // Call the PDF service
      const response = await fetch('http://localhost:8000/generate-question-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam: examData.exam,
          exam_set: examData.exam_set,
          template_type: 'bengali'
        })
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const result = await response.json();
      
      if (result.success && result.pdf_data) {
        // Decode base64 PDF content
        const pdfData = result.pdf_data;
        const binaryString = atob(pdfData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create PDF blob and download
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${examTitle || 'Bengali_Exam'}_${setName || 'Set_A'}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
        
        success('PDF প্রশ্নপত্র সফলভাবে ডাউনলোড হয়েছে!');
        onClose();
      } else {
        throw new Error('Invalid response from PDF service');
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      showError('PDF তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    const htmlContent = generateHTMLContent();
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
      success('প্রিভিউ নতুন উইন্ডোতে খুলেছে');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            বাংলা প্রশ্নপত্র তৈরি করুন
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Mock Data Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">প্রশ্নপত্রের তথ্য</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p><strong>শিরোনাম:</strong> {examTitle || 'মেধাবৃত্তী পরীক্ষা -২০২৫'}</p>
            <p><strong>সংগঠন:</strong> উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন</p>
            <p><strong>শ্রেণী:</strong> নবম শ্রেণী</p>
            <p><strong>সেট:</strong> {setName || 'সেট - A'}</p>
            <p><strong>প্রশ্নসংখ্যা:</strong> ৬০টি বহুনির্বাচনি প্রশ্ন</p>
            <p><strong>সময়:</strong> ৬০ মিনিট</p>
            <p><strong>পূর্ণমান:</strong> ৬০ নম্বর</p>
            <p><strong>ফরম্যাট:</strong> ২ পৃষ্ঠা A4 সাইজ PDF</p>
            <p className="text-sm text-blue-600 mt-2">
              <em>এটি PDF সার্ভিস ব্যবহার করে তৈরি করা প্রশ্নপত্র।</em>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">বিশেষ বৈশিষ্ট্য</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>৬০টি বাংলা বহুনির্বাচনি প্রশ্ন</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>প্রতিটি প্রশ্নে ৪টি বিকল্প (A, B, C, D)</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>২ পৃষ্ঠা A4 সাইজ PDF ফরম্যাট (কমপ্যাক্ট লেআউট)</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>প্রথম পৃষ্ঠা: ৩০ প্রশ্ন + নির্দেশনা, দ্বিতীয় পৃষ্ঠা: ৩০ প্রশ্ন</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>পেশাদার লেআউট ও নির্দেশনা</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>বাংলা ফন্ট সমর্থন (Noto Sans Bengali)</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>PDF সার্ভিস ব্যবহার করে PDF তৈরি</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'লোড হচ্ছে...' : 'প্রিভিউ'}
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'PDF তৈরি হচ্ছে...' : 'ডাউনলোড PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockPDFGenerator;

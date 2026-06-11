import React from 'react';
import { ShieldAlert, Check } from 'lucide-react';
import { User } from '../types';

interface MandatoryTermsModalProps {
  currentUser: User;
  onAccept: () => void;
}

export default function MandatoryTermsModal({ currentUser, onAccept }: MandatoryTermsModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl shadow-3xl p-6 md:p-8 space-y-5 relative border border-gray-150 text-right animate-scale-up flex flex-col max-h-[90vh]"
        id="mandatory-terms-modal-container"
      >
        {/* Banner with Alert */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 border border-amber-200">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 leading-none">
              موافقة إلزامية على شروط استخدام المنصة
            </h3>
            <p className="text-[11px] text-rose-500 font-extrabold mt-1.5 flex items-center gap-1">
              <span>⚠️</span>
              <span>يرجى مراجعة وقبول هذه الشروط لمتابعة استخدام حسابك بنجاح في سوق الجملة.</span>
            </p>
          </div>
        </div>

        {/* Scrollable Terms Text Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-slate-700 leading-relaxed font-normal custom-scrollbar text-justify pl-2">
          
          <div className="space-y-1">
            <span className="text-[10px] text-amber-600 bg-amber-50 py-0.5 px-2 rounded-md font-bold inline-block">سوق الجملة المغربي</span>
            <h4 className="font-extrabold text-slate-900 text-sm">سياسة المنصة وإخلاء المسؤولية</h4>
            <p className="text-gray-400 font-bold text-[11px]">Sou9AlJoumla - شروط وأحكام واستخدام المنصة</p>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-gray-200">
            <h5 className="font-black text-slate-900 text-xs border-b border-gray-200 pb-1 mb-1">إخلاء المسؤولية</h5>
            <p>منصة سوق الجملة هي منصة رقمية متخصصة في ربط المستوردين والموردين وتجار الجملة والمشترين المهنيين داخل المملكة المغربية. تقتصر خدمات المنصة على توفير أدوات النشر والتواصل والترويج للعروض التجارية بين المستخدمين.</p>
            <p>لا تشارك المنصة في عمليات البيع أو الشراء أو التفاوض بين الأطراف، ولا تمثل أي طرف في المعاملات التجارية، كما أنها لا تستلم أو تعالج أي مدفوعات أو تحويلات مالية تتعلق بالمنتجات أو الخدمات المعروضة.</p>
            <p>تتم جميع المفاوضات والاتفاقات وعمليات البيع والشراء بشكل مباشر وخارج المنصة بين المستخدمين، ويتحمل كل طرف المسؤولية الكاملة عن التحقق من صحة المعلومات والمنتجات والخدمات والالتزامات القانونية والتجارية المرتبطة بأي معاملة.</p>
          </div>

          <div className="space-y-1.5 p-1">
            <h5 className="font-black text-slate-900 text-xs border-b border-gray-250 pb-1 mb-1">مسؤولية المستخدمين</h5>
            <p>يتحمل كل مستخدم المسؤولية الكاملة عن المحتوى والمعلومات والبيانات والعروض التجارية التي يقوم بنشرها داخل المنصة.</p>
            <p>ويتعهد المستخدم بأن تكون جميع المعلومات المقدمة صحيحة ودقيقة ومحدثة، وألا تتضمن أي بيانات مضللة أو غير قانونية أو تنتهك حقوق الغير.</p>
            <p>تحتفظ المنصة بحق حذف أو تعديل أو إيقاف أي محتوى أو حساب يخالف القوانين المعمول بها أو شروط الاستخدام دون إشعار مسبق.</p>
          </div>

          <div className="space-y-1.5 p-1">
            <h5 className="font-black text-slate-900 text-xs border-b border-gray-250 pb-1 mb-1">الخصوصية وحماية البيانات</h5>
            <p>تلتزم المنصة بحماية البيانات الشخصية للمستخدمين واستخدامها فقط للأغراض المتعلقة بإدارة الحسابات وتحسين الخدمات وتسهيل التواصل بين الأطراف.</p>
            <p>لا تقوم المنصة ببيع البيانات الشخصية أو مشاركتها مع أطراف خارجية لأغراض تجارية دون موافقة المستخدم أو ما لم يكن ذلك مطلوباً بموجب القانون.</p>
            <p>قد يتم استخدام بعض المعلومات المنشورة داخل العروض التجارية بشكل ظاهر للمستخدمين الآخرين بهدف تسهيل التواصل وإتمام العلاقات التجارية.</p>
          </div>

          <div className="space-y-1.5 bg-amber-50/40 p-3.5 rounded-xl border border-amber-100">
            <h5 className="font-black text-slate-900 text-xs border-b border-amber-200 pb-1 mb-1">حدود مسؤولية المنصة</h5>
            <p>لا تضمن المنصة صحة أو جودة أو توفر المنتجات والخدمات أو المعلومات المنشورة من قبل المستخدمين.</p>
            <p className="font-extrabold text-slate-900 mt-1">كما لا تتحمل أي مسؤولية عن:</p>
            <ul className="list-disc list-inside space-y-1 mt-1 pr-1 text-[11px] text-slate-650">
              <li>أي خسائر مالية أو تجارية ناتجة عن التعامل بين المستخدمين.</li>
              <li>جودة المنتجات أو مطابقتها للمواصفات المعروضة.</li>
              <li>عمليات الاحتيال أو النزاعات التجارية والائتمانية بين الأطراف.</li>
              <li>أي اتفاقات أو عقود يتم إبرامها خارج المنصة.</li>
            </ul>
            <p className="font-bold text-[11px] text-slate-900 mt-2">وتبقى المسؤولية الكاملة عن أي معاملة أو اتفاق بين الأطراف المتعاملة مباشرة.</p>
          </div>

          <div className="space-y-1.5 p-1">
            <h5 className="font-black text-slate-900 text-xs border-b border-gray-250 pb-1 mb-1">قبول الشروط والتعديلات</h5>
            <p>تحتفظ إدارة منصة Sou9AlJoumla بحقها الكامل في تعديل أو تحديث أو تغيير أسعار الباقات والخدمات الإعلانية أو أي رسوم أخرى مرتبطة باستخدام المنصة في أي وقت، ويصبح ذلك ساري المفعول فور نشره، ويُعتبر استمرار الاستخدام موافقة ضمنية على التعديلات.</p>
            <p>باستخدام المنصة وإنشاء حساب أو نشر أي محتوى أو التواصل مع المستخدمين الآخرين، يقر المستخدم بأنه قرأ هذه الشروط وفهمها ويوافق عليها بالكامل وبلا استثناء.</p>
          </div>

        </div>

        {/* Accept Button Footer Box */}
        <div className="border-t border-gray-100 pt-4 shrink-0">
          <button
            type="button"
            onClick={onAccept}
            className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-black text-sm rounded-xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 border border-emerald-400"
            id="accept-mandatory-terms-btn"
          >
            <Check className="w-5 h-5 stroke-[3px]" />
            <span>أوافق على شروط واستخدام المنصة والخصوصية</span>
          </button>
          <div className="text-center mt-2.5">
            <span className="text-[10px] text-gray-400 font-mono">
              المستخدم الحالي المعني بالموافقة: {currentUser.name} ({currentUser.email})
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

import GeneratorInputPanel from '@/components/exam-prep/GeneratorInputPanel';
import GeneratorOutputPanel from '@/components/exam-prep/GeneratorOutputPanel';

export default function ExamPrepGenerator() {
  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Input Panel */}
        <div className="lg:w-[380px] shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <GeneratorInputPanel />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm min-h-[400px]">
            <GeneratorOutputPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

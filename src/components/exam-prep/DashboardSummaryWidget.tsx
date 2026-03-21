import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LicenseType } from '@/types/exam-prep';
import { Trophy, AlertTriangle, ArrowRight, BarChart3 } from 'lucide-react';

interface Props {
  licenseType: LicenseType | null;
}

export default function DashboardSummaryWidget({ licenseType }: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data } = useDashboardData(licenseType);

  if (!isAuthenticated || !licenseType || !data) return null;

  // Don't show if user has no quiz data yet
  if (data.totalQuestions === 0) return null;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-montserrat font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Your Progress
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 text-xs"
            onClick={() => navigate('/dashboard')}
          >
            View Dashboard <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-6">
          {/* Readiness Score */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-200 flex items-center justify-center bg-white">
              <span className="text-lg font-bold text-blue-700">{data.readinessScore}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Readiness</p>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-slate-700">
                {data.totalQuizzes} quiz{data.totalQuizzes !== 1 ? 'zes' : ''} taken
              </span>
            </div>

            {data.weakAreas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-700">Weak areas:</span>
                </div>
                <div className="flex flex-wrap gap-1 ml-6">
                  {data.weakAreas.slice(0, 3).map((area) => (
                    <Badge key={area} className="bg-red-100 text-red-700 text-xs border-red-200">
                      {area.replace(/\s*\(\d+%\)/, '')}
                    </Badge>
                  ))}
                  {data.weakAreas.length > 3 && (
                    <Badge className="bg-slate-100 text-slate-500 text-xs">
                      +{data.weakAreas.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {data.weakAreas.length === 0 && data.strongAreas.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-emerald-600 font-medium">
                  No weak areas detected — keep it up!
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { programAPI, childAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Users, Eye, Phone, Mail, Calendar } from 'lucide-react';

export default function ProgramChildrenPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [program, setProgram] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [programRes, childrenRes] = await Promise.all([
        programAPI.getById(id),
        childAPI.getAll()
      ]);
      
      const programData = programRes.data?.data;
      const allChildren = childrenRes.data?.data || [];
      
      // Filter children enrolled in this program
      const enrolledChildren = allChildren.filter(child => 
        child.programmes?.some(p => 
          p.type === programData?.type && 
          p.location === programData?.location?.name &&
          p.isActive
        )
      );
      
      setProgram(programData);
      setChildren(enrolledChildren);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Program Not Found</h2>
          <Button onClick={() => router.push('/programs')}>Back to Programs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/programs')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            👥 Enrolled Children
          </h1>
          <p className="text-gray-600">{program.name} - {children.length} children enrolled</p>
        </div>
      </div>

      {/* Program Summary */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-purple-900">{program.name}</h2>
            <p className="text-purple-700 capitalize">{program.type} Program</p>
            <p className="text-purple-600">📍 {program.location?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-900">{children.length}</div>
            <div className="text-sm text-purple-600">/ {program.capacity?.max} capacity</div>
            <div className="w-32 bg-purple-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(children.length / (program.capacity?.max || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Children List */}
      {children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <Card key={child._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {child.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'CH'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-600">Age {child.age}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  child.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {child.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{child.guardianName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{child.guardianPhone}</span>
                </div>
                {child.guardianEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{child.guardianEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Enrolled: {child.programmes?.find(p => 
                    p.type === program.type && 
                    p.location === program.location?.name &&
                    p.isActive
                  )?.startDate ? new Date(child.programmes.find(p => 
                    p.type === program.type && 
                    p.location === program.location?.name &&
                    p.isActive
                  ).startDate).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2"
                onClick={() => router.push(`/children/${child._id}`)}
              >
                <Eye className="w-4 h-4" />
                View Profile
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Enrolled</h3>
          <p className="text-gray-600 mb-4">This program doesn't have any enrolled children yet.</p>
          <Button onClick={() => router.push('/children')}>
            Browse Children
          </Button>
        </Card>
      )}
    </div>
  );
}
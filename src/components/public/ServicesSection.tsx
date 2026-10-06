import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Service } from '../../types/database';
import { getServiceImage } from '../../lib/images';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';

interface ServicesSectionProps {
  onSelectServiceToBook: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectServiceToBook }) => {
  const { activeServices, isLoading } = useClinic();

  return (
    <section id="services" className="py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comprehensive Dental Procedures</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              Preventive, restorative, and aesthetic smile solutions.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Transparent fees, unhurried consultations, and patient-first treatment plans. Every visit begins with clear expectations and compassionate care.
            </p>
          </div>

          <div className="text-sm text-slate-500 font-medium">
            <span className="font-semibold text-slate-900 tabular-nums">{activeServices.length}</span> active treatments offered
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && activeServices.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
                <div className="h-44 bg-slate-100 rounded-xl" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : activeServices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-500 font-medium">No dental services currently listed. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map((service, index) => {
              const imageSrc = getServiceImage(service.name);

              return (
                <div
                  key={service.id}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Service Visual Preview */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={service.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Numerical Index & Category */}
                    <div className="absolute top-3 left-3 text-xs font-semibold text-white/90 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-md">
                      0{index + 1}
                    </div>

                    {/* Price Tag in media corner */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-slate-900 shadow-sm">
                      <span className="text-xs text-slate-500 font-normal">from </span>
                      <span className="text-base font-bold tabular-nums">${service.price}</span>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span className="tabular-nums">{service.duration_minutes} minutes duration</span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {service.name}
                      </h3>

                      <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {service.description || 'Comprehensive dental consultation and customized treatment plan.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={() => onSelectServiceToBook(service)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-teal-700 text-slate-900 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer text-xs"
                      >
                        <span>Book This Treatment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

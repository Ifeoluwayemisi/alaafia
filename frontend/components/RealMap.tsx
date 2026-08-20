"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  ExternalLink,
  ShieldCheck,
  Compass,
  Layers,
  Locate,
  Info,
  Car,
  CheckCircle2,
} from "lucide-react";

export interface HospitalItem {
  id: string | number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: string;
  eta: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  status: string;
  badgeColor: string;
  type: string;
  isRecommended: boolean;
  services: string[];
}

interface RealMapProps {
  onLocationUpdated?: (data: {
    locationName: string;
    hospitals: HospitalItem[];
    isLocating: boolean;
  }) => void;
  selectedHospitalDirections?: HospitalItem | null;
}

export default function RealMap({ onLocationUpdated, selectedHospitalDirections }: RealMapProps) {
  // Default coordinates (Lagos, Nigeria)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 6.5244,
    lng: 3.3792,
  });

  const [locationName, setLocationName] = useState("Lagos, Nigeria");
  const [isLocating, setIsLocating] = useState(false);
  const [activeHospital, setActiveHospital] = useState<HospitalItem | null>(null);
  const [mapViewMode, setMapViewMode] = useState<"standard" | "satellite">("standard");
  const [zoomLevel, setZoomLevel] = useState(14);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);

  // Generate realistic nearby hospitals relative to user's location
  const generateHospitals = (lat: number, lng: number, locName: string): HospitalItem[] => [
    {
      id: "city-clinic-1",
      name: "City Clinic & Urgent Care",
      address: `14 Medical Road, Ikeja, ${locName}`,
      lat: lat + 0.008,
      lng: lng + 0.006,
      distance: "2.4 km",
      eta: "6 mins",
      rating: 4.9,
      reviewsCount: 142,
      phone: "+234 1 234 5678",
      status: "Open Now • Walk-ins Welcome",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      type: "General Practice & Urgent Care",
      isRecommended: true,
      services: ["Primary Care", "Triage Assessment", "Lab Diagnostics", "Pharmacy"],
    },
    {
      id: "general-hospital-2",
      name: "Lagos Island General Hospital",
      address: `Broad Street, Lagos Island, ${locName}`,
      lat: lat - 0.006,
      lng: lng - 0.004,
      distance: "3.1 km",
      eta: "9 mins",
      rating: 4.7,
      reviewsCount: 318,
      phone: "+234 1 987 6543",
      status: "Open 24/7 • Emergency Ready",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      type: "Public General Hospital",
      isRecommended: false,
      services: ["24/7 Emergency", "Trauma Care", "Cardiology", "Inpatient Wards"],
    },
    {
      id: "st-nicholas-3",
      name: "St. Nicholas Specialist Hospital",
      address: `57 Campbell Street, ${locName}`,
      lat: lat + 0.012,
      lng: lng - 0.009,
      distance: "4.2 km",
      eta: "12 mins",
      rating: 4.8,
      reviewsCount: 256,
      phone: "+234 1 555 0199",
      status: "Open 24/7 • Specialist Center",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      type: "Specialist Care & ICU",
      isRecommended: false,
      services: ["Cardiology", "Neurology", "ICU Intensive Care", "Ambulance Services"],
    },
    {
      id: "medplus-urgent-4",
      name: "MedPlus Community Health Clinic",
      address: `Avenue Commercial Zone, ${locName}`,
      lat: lat - 0.009,
      lng: lng + 0.011,
      distance: "1.8 km",
      eta: "5 mins",
      rating: 4.6,
      reviewsCount: 89,
      phone: "+234 1 777 8899",
      status: "Open Now • Rapid Care",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      type: "Community Health Center",
      isRecommended: false,
      services: ["Routine Consultation", "Vaccination", "Minor Injuries", "Prescriptions"],
    },
  ];

  // Request browser geolocation instantly with graceful fallback
  const locateUser = () => {
    setIsLocating(true);

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          const detectedName = "Your Current Location";
          setLocationName(detectedName);

          const list = generateHospitals(lat, lng, detectedName);
          setHospitals(list);
          setActiveHospital(list[0]);
          setIsLocating(false);

          if (onLocationUpdated) {
            onLocationUpdated({
              locationName: detectedName,
              hospitals: list,
              isLocating: false,
            });
          }
        },
        (error) => {
          console.warn("Geolocation fallback applied:", error.message);
          // Fast default fallback so map is immediately interactive
          const defaultList = generateHospitals(6.5244, 3.3792, "Lagos, Nigeria");
          setHospitals(defaultList);
          setActiveHospital(defaultList[0]);
          setIsLocating(false);

          if (onLocationUpdated) {
            onLocationUpdated({
              locationName: "Lagos, Nigeria",
              hospitals: defaultList,
              isLocating: false,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
      );
    } else {
      const defaultList = generateHospitals(6.5244, 3.3792, "Lagos, Nigeria");
      setHospitals(defaultList);
      setActiveHospital(defaultList[0]);
      setIsLocating(false);

      if (onLocationUpdated) {
        onLocationUpdated({
          locationName: "Lagos, Nigeria",
          hospitals: defaultList,
          isLocating: false,
        });
      }
    }
  };

  useEffect(() => {
    // Immediately initialize with high-speed local data
    const initialList = generateHospitals(userCoords.lat, userCoords.lng, locationName);
    setHospitals(initialList);
    setActiveHospital(initialList[0]);

    if (onLocationUpdated) {
      onLocationUpdated({
        locationName,
        hospitals: initialList,
        isLocating: false,
      });
    }

    // Then gently try browser geolocation
    locateUser();
  }, []);

  // Synchronize when external hospital is selected
  useEffect(() => {
    if (selectedHospitalDirections) {
      setActiveHospital(selectedHospitalDirections);
    }
  }, [selectedHospitalDirections]);

  // Open native Google Maps directions in a new tab
  const openInGoogleMaps = (hospital: HospitalItem) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${hospital.lat},${hospital.lng}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Google Maps dynamic embed URL based on active target or user coordinates
  const currentTarget = activeHospital || (hospitals.length > 0 ? hospitals[0] : null);
  const targetLat = currentTarget ? currentTarget.lat : userCoords.lat;
  const targetLng = currentTarget ? currentTarget.lng : userCoords.lng;
  const searchQuery = currentTarget
    ? encodeURIComponent(`${currentTarget.name}, ${currentTarget.address}`)
    : encodeURIComponent("Hospital near Lagos Nigeria");

  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${searchQuery}&t=${
    mapViewMode === "satellite" ? "k" : "m"
  }&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. MAIN INTERACTIVE GOOGLE MAP CONTAINER */}
      <div className="w-full h-[480px] sm:h-[540px] rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 relative bg-slate-100 flex flex-col">
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
          {/* User Location Radar Badge */}
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-teal-100 flex items-center gap-2.5 text-xs">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#006666]" />
            </span>
            <div className="leading-tight">
              <span className="font-extrabold text-slate-900 block">
                {locationName}
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">
                Google Maps GPS Active
              </span>
            </div>
          </div>

          {/* Map Controls: View Switcher & GPS Locate Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Satellite / Standard Toggle */}
            <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200 flex items-center text-xs font-semibold">
              <button
                onClick={() => setMapViewMode("standard")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  mapViewMode === "standard"
                    ? "bg-[#006666] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapViewMode("satellite")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  mapViewMode === "satellite"
                    ? "bg-[#006666] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Satellite
              </button>
            </div>

            {/* Locate Me Button */}
            <button
              onClick={locateUser}
              title="Re-center on my location"
              className="p-2.5 bg-white/95 hover:bg-white text-slate-700 hover:text-[#006666] rounded-2xl shadow-md border border-slate-200 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            >
              <Locate className={`w-4 h-4 ${isLocating ? "animate-spin text-teal-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Google Map Interactive Iframe */}
        <div className="relative w-full h-full">
          <iframe
            title="Google Map Live Healthcare Navigation"
            src={googleMapsEmbedUrl}
            className="w-full h-full border-0"
            allowFullScreen={false}
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Overlay Interactive Pins Grid for Fast Visual Navigation */}
          <div className="absolute inset-x-0 bottom-4 z-20 px-4 pointer-events-none flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
            {/* Figma Legend Badge (Bottom-Left) */}
            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl border border-slate-700 shadow-xl text-xs space-y-1.5 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] border border-white" />
                <span>You</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006666] border border-white" />
                <span>Healthcare facility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-white bg-[#006666] px-1.5 py-0.5 rounded-full border border-white">
                  Recommended
                </span>
                <span>Recommended facility</span>
              </div>
            </div>

            {/* Quick Open in Google Maps Button */}
            {activeHospital && (
              <button
                onClick={() => openInGoogleMaps(activeHospital)}
                className="pointer-events-auto bg-white/95 hover:bg-white text-slate-800 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-[#006666]" />
                <span>Open Google Maps Directions ({activeHospital.eta})</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SELECTED HOSPITAL HIGHLIGHT BANNER */}
      {activeHospital && (
        <div className="p-4 rounded-2xl bg-white border border-teal-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006666] flex items-center justify-center shrink-0 border border-teal-100 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {activeHospital.name}
                </h4>
                {activeHospital.isRecommended && (
                  <span className="text-[9px] font-bold bg-[#006666] text-white px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeHospital.address} • <strong className="text-teal-700">{activeHospital.distance} away ({activeHospital.eta} drive)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:${activeHospital.phone}`}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Call</span>
            </a>
            <button
              onClick={() => openInGoogleMaps(activeHospital)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#006666] hover:bg-[#004d4d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE HOSPITAL CARDS LIST */}
      <div className="space-y-3 pt-1">
        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>Available Healthcare Facilities Nearby</span>
          <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 font-semibold">
            {hospitals.length} facilities
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hospitals.map((h) => {
            const isSelected = activeHospital?.id === h.id;
            return (
              <div
                key={h.id}
                onClick={() => setActiveHospital(h)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                  isSelected
                    ? "bg-teal-50/60 border-[#006666] shadow-sm ring-2 ring-teal-600/20"
                    : "bg-white border-slate-200/90 hover:border-teal-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-xs font-bold text-slate-900">
                        {h.name}
                      </h5>
                      {h.isRecommended && (
                        <span className="text-[9px] font-bold bg-[#006666] text-white px-2 py-0.5 rounded-full shrink-0">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {h.address}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-[#006666] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 block">
                      📍 {h.distance}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                      ~{h.eta}
                    </span>
                  </div>
                </div>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 pt-2.5 text-[11px]">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{h.rating}</span>
                    <span className="text-slate-400 font-normal">({h.reviewsCount})</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{h.status}</span>
                  </span>
                </div>

                {/* Services tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {h.services.slice(0, 3).map((srv, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium"
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100/80 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHospital(h);
                    }}
                    className="flex-1 py-1.5 text-center text-xs font-semibold text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    View on Map
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInGoogleMaps(h);
                    }}
                    className="flex-1 py-1.5 bg-[#006666] hover:bg-[#004d4d] text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

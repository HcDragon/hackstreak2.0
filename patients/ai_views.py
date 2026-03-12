from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import MedicalRecord, Patient
import json

@api_view(['GET'])
def outbreak_prediction(request):
    """AI-based disease outbreak prediction"""
    
    # Get data from last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_records = MedicalRecord.objects.filter(visit_date__gte=thirty_days_ago)
    
    # Disease trend analysis
    disease_trends = recent_records.values('disease').annotate(
        total_cases=Count('id')
    ).order_by('-total_cases')
    
    # Location-based analysis
    location_trends = recent_records.values('patient__location', 'disease').annotate(
        cases=Count('id')
    )
    
    # Calculate outbreak risk
    predictions = []
    alerts = []
    
    for disease_data in disease_trends:
        disease = disease_data['disease']
        total_cases = disease_data['total_cases']
        
        # Get weekly breakdown
        weeks_data = []
        for i in range(4):
            week_start = datetime.now() - timedelta(days=(i+1)*7)
            week_end = datetime.now() - timedelta(days=i*7)
            week_cases = recent_records.filter(
                disease=disease,
                visit_date__gte=week_start,
                visit_date__lt=week_end
            ).count()
            weeks_data.append(week_cases)
        
        # Calculate growth rate
        if len(weeks_data) >= 2 and weeks_data[1] > 0:
            growth_rate = ((weeks_data[0] - weeks_data[1]) / weeks_data[1]) * 100
        else:
            growth_rate = 0
        
        # Risk assessment
        risk_level = 'LOW'
        if growth_rate > 50:
            risk_level = 'CRITICAL'
            alerts.append({
                'disease': disease,
                'message': f'CRITICAL: {disease} cases increased by {growth_rate:.1f}% in the last week',
                'severity': 'critical',
                'cases': total_cases,
                'growth_rate': growth_rate
            })
        elif growth_rate > 25:
            risk_level = 'HIGH'
            alerts.append({
                'disease': disease,
                'message': f'HIGH ALERT: {disease} showing rapid growth ({growth_rate:.1f}%)',
                'severity': 'high',
                'cases': total_cases,
                'growth_rate': growth_rate
            })
        elif growth_rate > 10:
            risk_level = 'MEDIUM'
        
        predictions.append({
            'disease': disease,
            'current_cases': total_cases,
            'weekly_trend': weeks_data,
            'growth_rate': round(growth_rate, 2),
            'risk_level': risk_level,
            'predicted_next_week': int(weeks_data[0] * (1 + growth_rate/100)) if weeks_data[0] > 0 else 0
        })
    
    # Location hotspots
    hotspots = []
    location_disease_count = {}
    
    for loc_data in location_trends:
        location = loc_data['patient__location']
        if location not in location_disease_count:
            location_disease_count[location] = 0
        location_disease_count[location] += loc_data['cases']
    
    avg_cases = sum(location_disease_count.values()) / len(location_disease_count) if location_disease_count else 0
    
    for location, cases in location_disease_count.items():
        if cases > avg_cases * 1.5:
            hotspots.append({
                'location': location,
                'total_cases': cases,
                'alert': f'{location} is a disease hotspot with {cases} cases'
            })
    
    return Response({
        'predictions': predictions[:10],
        'alerts': alerts,
        'hotspots': hotspots,
        'summary': {
            'total_diseases_tracked': len(disease_trends),
            'high_risk_diseases': len([p for p in predictions if p['risk_level'] in ['HIGH', 'CRITICAL']]),
            'total_alerts': len(alerts),
            'hotspot_locations': len(hotspots)
        }
    })

@api_view(['GET'])
def disease_recommendations(request):
    """AI-based disease prevention recommendations"""
    
    disease_name = request.query_params.get('disease', None)
    
    # Common disease recommendations database
    recommendations_db = {
        'Dengue': {
            'prevention': [
                'Eliminate standing water around homes',
                'Use mosquito repellents and nets',
                'Wear long-sleeved clothing',
                'Install window screens'
            ],
            'treatment': [
                'Stay hydrated with plenty of fluids',
                'Take paracetamol for fever (avoid aspirin)',
                'Get adequate rest',
                'Monitor platelet count regularly'
            ],
            'risk_factors': ['Monsoon season', 'Standing water', 'Poor sanitation'],
            'severity': 'High'
        },
        'Malaria': {
            'prevention': [
                'Use insecticide-treated bed nets',
                'Apply mosquito repellent',
                'Take antimalarial medication if traveling',
                'Eliminate mosquito breeding sites'
            ],
            'treatment': [
                'Seek immediate medical attention',
                'Complete full course of antimalarial drugs',
                'Stay hydrated',
                'Monitor symptoms closely'
            ],
            'risk_factors': ['Tropical regions', 'Rainy season', 'Poor drainage'],
            'severity': 'Critical'
        },
        'Typhoid': {
            'prevention': [
                'Drink only boiled or bottled water',
                'Eat thoroughly cooked food',
                'Wash hands frequently',
                'Get vaccinated'
            ],
            'treatment': [
                'Complete antibiotic course as prescribed',
                'Maintain proper hydration',
                'Eat easily digestible foods',
                'Isolate to prevent spread'
            ],
            'risk_factors': ['Contaminated water', 'Poor hygiene', 'Crowded areas'],
            'severity': 'High'
        },
        'COVID-19': {
            'prevention': [
                'Get vaccinated and boosted',
                'Wear masks in crowded places',
                'Maintain social distancing',
                'Wash hands frequently'
            ],
            'treatment': [
                'Isolate immediately',
                'Monitor oxygen levels',
                'Stay hydrated',
                'Consult doctor for antiviral medications'
            ],
            'risk_factors': ['Crowded spaces', 'Poor ventilation', 'Unvaccinated'],
            'severity': 'Critical'
        },
        'Tuberculosis': {
            'prevention': [
                'Ensure good ventilation',
                'Get BCG vaccination',
                'Avoid close contact with TB patients',
                'Maintain good nutrition'
            ],
            'treatment': [
                'Complete 6-9 month antibiotic course',
                'Never skip doses',
                'Regular follow-up with doctor',
                'Nutritious diet and rest'
            ],
            'risk_factors': ['Crowded living', 'Weak immunity', 'Malnutrition'],
            'severity': 'Critical'
        }
    }
    
    if disease_name:
        recommendation = recommendations_db.get(disease_name, {
            'prevention': ['Maintain good hygiene', 'Eat healthy food', 'Exercise regularly'],
            'treatment': ['Consult a doctor immediately', 'Follow prescribed medication', 'Get adequate rest'],
            'risk_factors': ['Varies by disease'],
            'severity': 'Medium'
        })
        return Response({
            'disease': disease_name,
            'recommendations': recommendation
        })
    
    return Response({
        'available_diseases': list(recommendations_db.keys()),
        'message': 'Use ?disease=DiseaseName to get specific recommendations'
    })

@api_view(['GET'])
def patient_risk_assessment(request):
    """Assess patient risk based on location and medical history"""
    
    patient_id = request.query_params.get('patient_id', None)
    
    if not patient_id:
        return Response({'error': 'patient_id parameter required'}, status=400)
    
    try:
        patient = Patient.objects.get(patient_id=patient_id)
        records = MedicalRecord.objects.filter(patient=patient)
        
        # Analyze patient's disease history
        disease_history = list(records.values_list('disease', flat=True))
        
        # Check location risk
        location_disease_count = MedicalRecord.objects.filter(
            patient__location=patient.location
        ).values('disease').annotate(count=Count('id')).order_by('-count')
        
        # Risk calculation
        risk_score = 0
        risk_factors = []
        
        # Age-based risk
        if patient.age > 60:
            risk_score += 30
            risk_factors.append('Age above 60 (high risk group)')
        elif patient.age < 5:
            risk_score += 25
            risk_factors.append('Age below 5 (vulnerable group)')
        
        # Disease history risk
        if len(disease_history) > 3:
            risk_score += 20
            risk_factors.append(f'Multiple disease history ({len(disease_history)} conditions)')
        
        # Location risk
        if location_disease_count.count() > 5:
            risk_score += 25
            risk_factors.append(f'High disease prevalence in {patient.location}')
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = 'CRITICAL'
        elif risk_score >= 50:
            risk_level = 'HIGH'
        elif risk_score >= 30:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'
        
        # Recommendations
        recommendations = []
        if risk_level in ['HIGH', 'CRITICAL']:
            recommendations.extend([
                'Schedule regular health checkups',
                'Maintain vaccination records up to date',
                'Follow preventive measures strictly',
                'Keep emergency contacts ready'
            ])
        
        # Diseases prevalent in location
        location_diseases = [
            {'disease': d['disease'], 'cases': d['count']} 
            for d in location_disease_count[:5]
        ]
        
        return Response({
            'patient_id': patient.patient_id,
            'name': patient.name,
            'age': patient.age,
            'location': patient.location,
            'risk_assessment': {
                'risk_score': risk_score,
                'risk_level': risk_level,
                'risk_factors': risk_factors
            },
            'disease_history': disease_history,
            'location_risk': {
                'prevalent_diseases': location_diseases,
                'total_cases_in_area': sum(d['count'] for d in location_disease_count)
            },
            'recommendations': recommendations
        })
        
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

@api_view(['GET'])
def real_time_alerts(request):
    """Generate real-time health alerts"""
    
    alerts = []
    
    # Check for sudden spikes in last 7 days
    seven_days_ago = datetime.now() - timedelta(days=7)
    fourteen_days_ago = datetime.now() - timedelta(days=14)
    
    # Get disease counts for comparison
    recent_diseases = MedicalRecord.objects.filter(
        visit_date__gte=seven_days_ago
    ).values('disease', 'patient__location').annotate(count=Count('id'))
    
    previous_diseases = MedicalRecord.objects.filter(
        visit_date__gte=fourteen_days_ago,
        visit_date__lt=seven_days_ago
    ).values('disease', 'patient__location').annotate(count=Count('id'))
    
    # Create comparison dict
    previous_dict = {
        f"{d['disease']}_{d['patient__location']}": d['count'] 
        for d in previous_diseases
    }
    
    for recent in recent_diseases:
        key = f"{recent['disease']}_{recent['patient__location']}"
        previous_count = previous_dict.get(key, 0)
        current_count = recent['count']
        
        if previous_count > 0:
            increase = ((current_count - previous_count) / previous_count) * 100
            
            if increase > 100:
                alerts.append({
                    'type': 'OUTBREAK_ALERT',
                    'severity': 'CRITICAL',
                    'disease': recent['disease'],
                    'location': recent['patient__location'],
                    'message': f"CRITICAL: {recent['disease']} cases in {recent['patient__location']} increased by {increase:.0f}%",
                    'current_cases': current_count,
                    'previous_cases': previous_count,
                    'timestamp': datetime.now().isoformat()
                })
            elif increase > 50:
                alerts.append({
                    'type': 'WARNING',
                    'severity': 'HIGH',
                    'disease': recent['disease'],
                    'location': recent['patient__location'],
                    'message': f"WARNING: {recent['disease']} cases rising in {recent['patient__location']} (+{increase:.0f}%)",
                    'current_cases': current_count,
                    'previous_cases': previous_count,
                    'timestamp': datetime.now().isoformat()
                })
        elif current_count >= 3:
            alerts.append({
                'type': 'NEW_OUTBREAK',
                'severity': 'MEDIUM',
                'disease': recent['disease'],
                'location': recent['patient__location'],
                'message': f"NEW: {recent['disease']} detected in {recent['patient__location']} ({current_count} cases)",
                'current_cases': current_count,
                'timestamp': datetime.now().isoformat()
            })
    
    return Response({
        'alerts': alerts,
        'total_alerts': len(alerts),
        'critical_alerts': len([a for a in alerts if a['severity'] == 'CRITICAL']),
        'generated_at': datetime.now().isoformat()
    })

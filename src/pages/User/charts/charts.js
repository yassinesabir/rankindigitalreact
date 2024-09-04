import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxios from '../../../security/axiosInstance';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Chart, registerables } from 'chart.js';
import "./charts.css"

// Register all the necessary components of Chart.js
Chart.register(...registerables);

// Fetch leads data
const fetchLeads = async (axiosInstance) => {
  const response = await axiosInstance.get('/user');
  return response.data;
};

const sortMonths = (months) => {
  return months.sort((a, b) => new Date(a + '-01') - new Date(b + '-01'));
};

// Chart Components
const LeadsValueChart = ({ leads }) => {
  const data = {
    labels: leads.sort((a, b) => b.valeurEstimee - a.valeurEstimee).map(lead => lead.nom),
    datasets: [
      {
        label: 'Valeur Estimée',
        data: leads.map(lead => lead.valeurEstimee),
        backgroundColor: '#FFCE56',
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { callback: (value) => `${value} MAD` },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

const LeadsSourceChart = ({ leads }) => {
  const sourceData = leads.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(sourceData),
    datasets: [
      {
        label: 'Source',
        data: Object.values(sourceData),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40','#00850D'],
      },
    ],
  };

  const options = {
    plugins: {
      legend: { position: 'right' },
    },
  };

  return <Doughnut data={data} options={options} />;
};

const LeadsStatusTimelineChart = ({ leads }) => {
  // Group data by month and status
  const groupedData = leads.reduce((acc, lead) => {
    const month = new Date(lead.dateCreation).toISOString().slice(0, 7); // 'YYYY-MM'
    if (!acc[month]) acc[month] = { converted: 0, abandoned: 0 };
    if (lead.statut === 'Gagné') acc[month].converted += 1;
    if (lead.statut === 'Abandonné') acc[month].abandoned += 1;
    return acc;
  }, {});

  // Extract and sort months
  const months = Object.keys(groupedData);
  const sortedMonths = sortMonths(months);

  // Prepare data for the bar chart
  const data = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Gagné',
        data: sortedMonths.map(month => groupedData[month].converted || 0),
        backgroundColor: '#00850D',
        stack: 'stack0',
      },
      {
        label: 'Abandonné',
        data: sortedMonths.map(month => groupedData[month].abandoned || 0),
        backgroundColor: '#FF4D4F',
        stack: 'stack1',
      },
    ],
  };

  // Define options for the bar chart
  const options = {
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      x: {
        stacked: true, // Ensure bars are stacked
        title: { display: true, text: 'Mois' },
      },
      y: {
        stacked: true, // Ensure bars are stacked
        beginAtZero: true,
        title: { display: true, text: 'Nombre des prospects' },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

const LeadsUserComparisonChart = ({ leads }) => {
  const userData = leads.reduce((acc, lead) => {
    acc[lead.createdBy] = (acc[lead.createdBy] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(userData),
    datasets: [
      {
        label: ' Nombre De Prospects créés',
        data: Object.values(userData),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  const options = {
    plugins: {
      legend: { position: 'right' },
    },
  };

  return <Pie data={data} options={options} />;
};

// Main Charts Component
const Charts = () => {
  const axiosInstance = useAxios();
  const { data: leads = [], error, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchLeads(axiosInstance),
  });

  if (isLoading) return <p>Chargement des Tableaux De Bord...</p>;
  if (error) return <p>Erreur Chargement des données</p>;

  return (
    <div className="charts-container">
      <div className="left-container">
        <div className="chart-box">
          <h3>Meilleur offre</h3>
          <div className="chart-content">
            <LeadsValueChart leads={leads} />
          </div>
        </div>
        <div className="chart-box">
          <h3>Prospects Regroupés Par Source</h3>
          <div className="chart-content">
            <LeadsSourceChart leads={leads} />
          </div>
        </div>
      </div>
      <div className="right-container">
        <div className="chart-box">
          <h3>Prospects Regroupés Par Statut</h3>
          <div className="chart-content">
            <LeadsStatusTimelineChart leads={leads} />
          </div>
        </div>
        <div className="chart-box">
          <h3>Prospects Regroupés Par Utilisateur</h3>
          <div className="chart-content">
            <LeadsUserComparisonChart leads={leads} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;

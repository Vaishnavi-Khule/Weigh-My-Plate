import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const Linegraph = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (data.length > 0 && chartRef.current) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const myChartRef = chartRef.current.getContext("2d");

            // Extract dates and totalCal from the data
            const labels = data.map(item => item.date); // Assuming 'date' is the property name containing the date information
            const totalCalories = [...data.map(item => item.totalCal)]; // Adding 0 at the beginning

            chartInstance.current = new Chart(myChartRef, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total Calorie',
                        data: totalCalories,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Total Calorie'
                            }
                        },
                        x: {
                            type: 'category',
                            title: {
                                display: true,
                                text: 'Dates'
                            }
                        }
                    }
                }
            });
        }
    }, [data]);

    return (
        <div className="lineGraphMainContainer">
            <div className="lineGraphContainer">
                <canvas id="myChart" ref={chartRef} />
            </div>
        </div>
    );
};

export default Linegraph;

import React from 'react';

const lifeEvents = [
    {
        name: 'Dhaka, Bangladesh',
        lat: 15.0906,
        lon: 192.3428,
        age: '0',
        description: "Born in Dhaka, in the vibrant capital of Bangladesh. I begun my life here, while I did have a very short stay here. I visited family every year after moving to Dubai. Embracing my time with my cousins and reflecting on how different both the countries can be."
    },
    {
        name: 'Dubai, United Arab Emirates',
        lat: 19.4752,
        lon: 140.0686,
        age: '3 months old',
        description: 'Moved to Dubai at just 3 months old. My parents, full of hope and ambition, started our new life in a modest environment. Growing up surrounded by tall sky scrapers juxtaposed by small cornershops, I witnessed its immense growth and development. The blend of traditional Arab culture with international influences shaped my early worldview.'
    },
    {
        name: 'New York, United States',
        lat: 34.9451,
        lon: 12.8719,
        age: '17 years old',
        description: 'At 17, I embarked on a trip to the United States with my family. During my trip here, going across to diners, strip malls and taking in the cultural influence helped me realize that it would ultimately be one of my dream desires to be able to study and gain experience somewhere within North America.'
    },
    {
        name: 'Manitoba, Canada',
        lat: 39.5288,
        lon: -8.9005,
        age: '20 years old',
        description: "I had moved to Canada, to pursue a Computer Science degree at the University of Manitoba. The adjustment from the desert climate of Dubai to the harsh Canadian winters was challenging but exhilarating. Over the past two years, I've immersed myself in a new culture, joined various student groups, and built a diverse network of friends from around the world. The Canadian emphasis on multiculturalism has allowed me to embrace my background while integrating into a new society. My journey so far has been both challenging and rewarding, where I hope that I can continue to work with people from all walks of life."
    }
];

const LifeEvents = ({ currentEvent }) => {
  return (
    <div className="life-event-info">
      <h2>{currentEvent.name}</h2>
      <p>Age: {currentEvent.age}</p>
      <p>{currentEvent.description}</p>
    </div>
  );
};

export default LifeEvents;

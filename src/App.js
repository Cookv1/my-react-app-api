import React, { useEffect, useState, useCallback } from "react";

const App = () => {
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRandomKantoPokemonWithEvolution = useCallback(async () => {
    setIsLoading(true);
    try {
      let randomPokemonId;
      do {
        randomPokemonId = Math.floor(Math.random() * 151) + 1; // Random ID between 1 and 151
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}/`);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        console.log("Pokemon data:", data);
        if (data.species) {
          console.log("Species URL:", data.species.url);
          const speciesResponse = await fetch(data.species.url);
          if (!speciesResponse.ok) {
            throw new Error(speciesResponse.statusText);
          }
          const speciesData = await speciesResponse.json();
          console.log("Species data:", speciesData);
          const kantoPokemon = speciesData.generation.name === "generation-i"; // Check if the Pokémon is from Kanto
          if (kantoPokemon) {
            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            if (!evolutionResponse.ok) {
              throw new Error(evolutionResponse.statusText);
            }
            const evolutionData = await evolutionResponse.json();
            console.log("Evolution data:", evolutionData);
            const chain = extractEvolutionChain(evolutionData);
            setEvolutionChain(chain);
            break;
          }
        }
      } while (true);
    } catch (error) {
      setError('Could not fetch data');
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extractEvolutionChain = (data) => {
    const chain = [];
    let current = data.chain;
    while (current) {
      chain.push(current.species);
      if (current.evolves_to.length > 0) {
        // If there are multiple evolutions, choose the first one
        current = current.evolves_to[0];
      } else {
        // If no more evolutions, break the loop
        break;
      }
    }
    return chain;
  };

  useEffect(() => {
    fetchRandomKantoPokemonWithEvolution();
  }, [fetchRandomKantoPokemonWithEvolution]);

  const handleFetchEvolution = () => {
    fetchRandomKantoPokemonWithEvolution();
  };

  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  if (error) {
    return <h1>Error: {error}</h1>;
  }
  if (evolutionChain.length === 0) {
    return null;
  }

  return (
    <div className="app-container">
      <h1>Evolutions</h1>
      <div className="sprite-container">
        {evolutionChain.map((pokemon, index) => (
          <div className="sprite-item" key={index}>
            <div className="sprite-circle"></div> {/* White circle background */}
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split("/")[6]}.png`} alt={pokemon.name} />
            <p>{pokemon.name}</p>
          </div>
        ))}
      </div>
      <button onClick={handleFetchEvolution}>Fetch Evolution</button>
    </div>
  );
};

export default App;

import React, { useEffect, useState, useCallback } from "react";

const App = () => {
  // State variables to manage data fetching, error handling, and loading state
  const [evolutionChain, setEvolutionChain] = useState([]); // Stores the evolution chain of a Pokemon
  const [error, setError] = useState(null); // Stores any error occurred during data fetching
  const [isLoading, setIsLoading] = useState(false); // Indicates if data is currently being fetched

  // Function to fetch a random Kanto Pokemon with its evolution chain
  const fetchRandomKantoPokemonWithEvolution = useCallback(async () => {
    setIsLoading(true); // Start loading

    try {
      let randomPokemonId;
      do {
        // Generate a random Pokemon ID between 1 and 151
        randomPokemonId = Math.floor(Math.random() * 151) + 1;

        // Fetch data for the random Pokemon using the PokeAPI
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}/`);
        
        // Check if the response is ok; otherwise, throw an error
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        // Parse the response into JSON format
        const data = await response.json();

        // Check if the fetched Pokemon has species data
        if (data.species) {
          // Fetch species data for the Pokemon
          const speciesResponse = await fetch(data.species.url);
          
          // Check if the species response is ok; otherwise, throw an error
          if (!speciesResponse.ok) {
            throw new Error(speciesResponse.statusText);
          }

          // Parse the species response into JSON format
          const speciesData = await speciesResponse.json();

          // Check if the fetched Pokemon is from the Kanto region
          const kantoPokemon = speciesData.generation.name === "generation-i";

          // If the Pokemon is from Kanto, fetch its evolution chain
          if (kantoPokemon) {
            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            
            // Check if the evolution response is ok; otherwise, throw an error
            if (!evolutionResponse.ok) {
              throw new Error(evolutionResponse.statusText);
            }

            // Parse the evolution response into JSON format
            const evolutionData = await evolutionResponse.json();

            // Extract the evolution chain from the fetched data
            const chain = extractEvolutionChain(evolutionData);

            // Set the fetched evolution chain in the state
            setEvolutionChain(chain);

            // Exit the loop as we've successfully fetched and set the evolution chain
            break;
          }
        }
      } while (true); // Repeat the loop until a Pokemon from the Kanto region is fetched
    } catch (error) {
      // If any error occurs during the try block execution, set the error state and log the error message
      setError('Could not fetch data');
      console.error(error.message);
    } finally {
      // Regardless of whether there was an error or not, stop loading state
      setIsLoading(false);
    }
  }, []);

  // Function to extract the evolution chain from the API response data
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

  // Fetch data on component mount or when fetch function changes
  useEffect(() => {
    fetchRandomKantoPokemonWithEvolution();
  }, [fetchRandomKantoPokemonWithEvolution]);

  // Handler function to fetch evolution when button is clicked
  const handleFetchEvolution = () => {
    fetchRandomKantoPokemonWithEvolution();
  };

  // Render loading message while fetching data
  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  // Render error message if an error occurred
  if (error) {
    return <h1>Error: {error}</h1>;
  }
  // Render nothing if evolution chain is empty
  if (evolutionChain.length === 0) {
    return null;
  }

  // Render the fetched Pokemon evolution chain
  return (
    <div className="app-container">
      <h1>Pokemon Evolution Generator</h1>
      <h3>Use the fetch button to randomly generate a Pokemon. If the Pokemon has an evolution, it will show.</h3>
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


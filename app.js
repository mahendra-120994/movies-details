const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.massage}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// GET Movies name API 1
app.get("/movies/", async (req, res) => {
  const getMoviesQuery = `
    SELECT
    movie_name
    FROM
    movie
    `;
  const moviesArray = await db.all(getMoviesQuery);
  res.send(
    moviesArray.map((eachMovie) => {
      const keysList = Object.keys(eachMovie);
      const newObj = {};
      keysList.map((eachKey) => {
        const key = eachKey.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) =>
          chr.toUpperCase()
        );
        newObj[key] = eachMovie[eachKey];
      });
      return newObj;
    })
  );
});

// ADD movies API 2
app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (${directorId},'${movieName}','${leadActor}');`;
  await db.run(addMovieQuery);
  res.send("Movie Successfully Added");
});

// GET movie by ID API 3
app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieData = await db.get(getMovieQuery);
  const movie = {};
  const listOfKeys = Object.keys(movieData);
  listOfKeys.map((eachKey) => {
    const key = eachKey.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) =>
      chr.toUpperCase()
    );
    movie[key] = movieData[eachKey];
  });
  res.send(movie);
});

// Update Movie API 4
app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE 
   movie
  SET
   director_id=${directorId},
   movie_name='${movieName}',
   lead_actor='${leadActor}'
  WHERE
   movie_Id = ${movieId}`;
  await db.run(updateMovieQuery);
  res.send("Movie Details Updated");
});

// Delete Movie API 5
app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE
        movie_Id = ${movieId};`;
  await db.run(deleteMovieQuery);
  res.send("Movie Removed");
});

// GET Directors name API 6
app.get("/directors/", async (req, res) => {
  const getDirectorsQuery = `
    SELECT
    *
    FROM
    director
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  res.send(
    directorsArray.map((eachDirector) => {
      const keysList = Object.keys(eachDirector);
      const newObj = {};
      keysList.map((eachKey) => {
        const key = eachKey.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) =>
          chr.toUpperCase()
        );
        newObj[key] = eachDirector[eachKey];
      });
      return newObj;
    })
  );
});

// GET Movies by Director ID API 7
app.get("/directors/:directorId/movies/", async (req, res) => {
  const Id = req.params;
  const getMoviesQuery = `
    SELECT
    movie.movie_name
    FROM movie 
    Join director ON movie.director_id = director.director_id
    WHERE
    director.director_id = ${Id.directorId}
    `;
  const moviesArray = await db.all(getMoviesQuery);
  res.send(
    moviesArray.map((eachMovie) => {
      const keysList = Object.keys(eachMovie);
      const newObj = {};
      keysList.map((eachKey) => {
        const key = eachKey.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) =>
          chr.toUpperCase()
        );
        newObj[key] = eachMovie[eachKey];
      });
      return newObj;
    })
  );
});

module.exports = app;

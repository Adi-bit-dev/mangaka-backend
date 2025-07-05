const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("./db.js");
const Manga = require("./models/mangaModel.js");
const User = require("./models/userModel.js");
const Chapter = require("./models/chapterModel.js");

const cors = require('cors');
app.use(express.json()); // for parsing application/json

// Allow all origins
app.use(cors());

app.post("/login-user", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            message: "all fields are required"
        }) // when either of three is missing
    } else {
        // proceed with user login
        try {
            const user = await User.findOne({
                email: email,
                password: password,
            });

            if (user) {
                // when the user is successfully found in the database
                res.status(201).json({
                    message: "user found in database"
                })
            } else {
                res.status(400).json({
                    message: "user not found"
                })
            }
        } catch (err) {
            console.log("Error in login endpoint: ", err);
        }
    }
})

// endpoint to handle google login and signup
app.post("/google-login", async (req, res) => {
    // extract info
    const { email, profile_pic, name, password } = req.body;

    // find user in database
    try {
        const user = await User.findOne({
            email: email,
            password: password,
            username: name,
            profile_pic: profile_pic
        })

        if (user) {
            // user found in database
            res.status(201).json({
                message: "user found in database",
                user: user
            });
        } else {
            // proceed to create a new user

            const newUser = new User({
                email: email,
                password: password,
                username: name,
                profile_pic: profile_pic
            })

            await newUser.save();

            res.status(201).json({
                message: "user created successfully",
                user: newUser
            });
        }
    } catch (err) {
        console.log(" error occurred in google-login endpoint: ", err);
    }
})

app.get('/', (req, res) => {
    res.send('This is the backend of mangaka');
});

app.post("/newManga", async (req, res) => {
    const { title, author, description, status, ratings, Coverimg, tags } = req.body;

    if (!title || !description || !status || !ratings || !Coverimg || !tags) {
        res.status(400).json({
            message: "All fields are required"
        });
    } else {
        try {
            const manga = await Manga.findOne({ title: title });

            if (manga) {
                res.status(400).json({
                    message: "Manga already exists"
                });
                return
            } else {
                // proceed to create a new manga

                const newManga = new Manga({
                    title,
                    author,
                    description,
                    status,
                    ratings,
                    Coverimg,
                    tags
                });

                await newManga.save();

                res.status(201).json({
                    message: "Manga created successfully",
                    manga: newManga
                });

                console.log("Manga created successfully");
            }
        } catch (error) {
            console.error("Error creating manga:", error);
        }
    }
})

app.get("/get-latest-manga", async (req, res) => {
    try {
        const latestManga = await Manga.find()
            .sort({ createdAt: -1 }) // Sort by most recent
            .limit(8);               // Limit to 8 entries

        res.status(200).json(latestManga);
    } catch (err) {
        console.error("Error fetching latest manga:", err);
        res.status(500).json({ message: "Server error" });
    }
})

app.get("/search", async (req, res) => {
    try {
        const titleQuery = req.query.titleQuery?.trim();
        if (!titleQuery) {
            return res.status(400).json({ error: "Title query is required" });
        }

        const exactMatch = await Manga.findOne({
            title: new RegExp(`^${titleQuery}$`, 'i')
        });

        if (!exactMatch) {
            return res.status(404).json({ error: "Manga not found" });
        }

        if (!Array.isArray(exactMatch.tags) || exactMatch.tags.length === 0) {
            return res.status(404).json({ error: "No tags found to suggest related manga" });
        }

        const related = await Manga.find({
            _id: { $ne: exactMatch._id },
            tags: { $in: exactMatch.tags }
        }).limit(10);

        const complete_result = [exactMatch, ...related];

        res.json({
            complete_result
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/search-genre", async (req, res) => {
    try {
        const genre = req.query.genre?.trim();

        if (!genre) {
            return res.status(400).json({ error: "Genre is required" });
        }

        const mangaGenres = await Manga.find({
            tags: { $in: [genre] }  // Search for genre in tags array
        }).limit(25);

        if (!mangaGenres || mangaGenres.length === 0) {
            return res.status(404).json({ error: "No manga found with selected genre" });
        }

        res.json({ mangaGenres });
        console.log("search-genre result send");

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/assignChapters", async (req, res) => {
    const { title, image, mangaTitle } = req.body;

    try {
        // Correctly query the Manga by its title field
        const manga = await Manga.findOne({ title: mangaTitle });

        if (!manga) {
            return res.status(404).json({ message: 'Manga not found' });
        }

        // Count how many chapters exist for this manga
        const count = await Chapter.countDocuments({ manga: mangaTitle });

        // Create a new chapter
        const newChapter = new Chapter({
            manga: mangaTitle, // This matches the field name in the Chapter schema
            title: title,
            image: image,
            number: count + 1
        });

        await newChapter.save();

        res.status(201).json({ message: 'Chapter created', chapter: newChapter });
    } catch (err) {
        res.status(500).json({ message: 'Error creating chapter', error: err.message });
    }
});


app.get("/manga-chapters", async (req, res) => {
    const title = req.query.title.trim(); // extract the title of the manga from the rqery params

    if (!title) {
        return res.status(400).json({ error: "Title query is required" });
    }
    else {
        try {
            const chapters = await Chapter.find({ manga: title })
                .sort({ createdAt: 1 }); // Ascending (oldest → newest). Use -1 for newest → oldest

            res.status(200).json(chapters);
            console.log(chapters);

        } catch (err) {
            console.log("Failed to send manga chapters: ", err);
        }
    }
})

app.get("/specific-manga-chapter", async (req, res) => {
    const title = req.query.title?.trim();
    const chapter_no = parseInt(req.query.chapter_no);

    if (!title || isNaN(chapter_no)) {
        return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    try {
        const titleMatch = await Chapter.findOne({ manga: title });

        if (!titleMatch) {
            return res.status(404).json({ message: 'Manga not found' });
        }

        const chapter = await Chapter.findOne({
            manga: title,
            number: chapter_no
        });

        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        res.json({ chapter });

    } catch (err) {
        console.error("Error in /specific-manga-chapter:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/get-trending-manga", async (req, res) => {
    try {
        const trendingManga = await Manga.find({})
            .sort({ views: -1, bookmarks: -1 }) // Sort by views first, then bookmarks
            .limit(5); // Optional: limit results

        res.status(200).json(trendingManga);
    } catch (error) {
        console.error("Error fetching trending manga:", error);
        res.status(500).json({ error: "Failed to fetch trending manga" });
    }
});

app.post('/postBookmarks', async (req, res) => {
    const { mangaName, email } = req.body;

    if (!mangaName) {
        res.status(404).json({ message: 'manga name not provided' })
    } else {
        try {
            const manga = await Manga.findOne({ title: mangaName });

            // find user in databse
            const user = await User.findOne({ email: email })
            if (!user) {
                res.status(400).json({ message: 'bro what did you do the user dosent even exist' })
            } else {
                // Check if already bookmarked
                if (user.bookmarks.includes(mangaName)) {
                    return res.status(409).json({ message: 'Manga already bookmarked' });
                }

                // Add manga name to bookmarks array
                user.bookmarks.push(mangaName);
                await user.save();

                return res.status(200).json({ message: 'Manga bookmarked successfully' });
            }
        } catch (err) {
            console.log("error in the post bookmarks endpoint: ", err);
        }
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

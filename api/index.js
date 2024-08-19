const express = require('express');
const cors = require('cors');
const blogs = require('./blogsData.json'); 
const port = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send("Blog server is running!");
});

// Get all blogs with pagination
app.get('/paginatedBlogs', (req, res) => {
    const { page = 1, limit = 12 } = req.query;

    const pageSize = parseInt(limit, 10);
    const currentPage = parseInt(page, 10);
    const totalItems = blogs.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBlogs = blogs.slice(startIndex, endIndex);

    res.json({
        blogs: paginatedBlogs,
        totalPages: totalPages,
        totalItems: totalItems
    });
});

// Get all blogs without pagination
app.get('/blogs', (req, res) => {
    res.json({
        blogs: blogs
    });
});

// Get a single blog by Cid
app.get('/blogs/:Cid', (req, res) => {
    const Cid = parseInt(req.params.Cid, 10);
    const blog = blogs.find(b => b.Cid === Cid);
    if (blog) {
        res.json(blog);
    } else {
        res.status(404).json({ error: 'Blog not found' });
    }
});

// Get all blogs by the first word of NameMMT with pagination
app.get('/blogs/firstWord/:firstWord', (req, res) => {
    const { page = 1, limit = 12 } = req.query;
    const firstWord = req.params.firstWord.toUpperCase(); // Convert firstWord to uppercase for case-insensitive comparison

    const pageSize = parseInt(limit, 10);
    const currentPage = parseInt(page, 10);

    // Filter blogs by the first word of NameMMT
    const filteredBlogs = blogs.filter(blog => {
        const blogFirstWord = blog.NameMMT.split(' ')[0].toUpperCase();
        return blogFirstWord === firstWord;
    });

    const totalItems = filteredBlogs.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

    res.json({
        blogs: paginatedBlogs,
        totalPages: totalPages,
        totalItems: totalItems
    });
});

// Get car summary by model
app.get('/dashboard/car-summary', (req, res) => {
    const carSummary = {};

    blogs.forEach(blog => {
        const { Model, Prc } = blog;
        const price = parseInt(Prc.replace(/,/g, ''), 10); 
        
        if (!carSummary[Model]) {
            carSummary[Model] = { count: 0, value: 0 };
        }
        carSummary[Model].count += 1;
        carSummary[Model].value += price;
    });

    res.json(carSummary);
});

// Get brand summary for pie chart
app.get('/dashboard/brand-summary', (req, res) => {
    const brandSummary = {};

    blogs.forEach(blog => {
        const firstWord = blog.NameMMT.split(' ')[0].toUpperCase();
        const price = parseInt(blog.Prc.replace(/,/g, ''), 10);

        if (!brandSummary[firstWord]) {
            brandSummary[firstWord] = { count: 0, value: 0 };
        }
        brandSummary[firstWord].count += 1;
        brandSummary[firstWord].value += price;
    });

    res.json(brandSummary);
});

// Get car values by model
app.get('/dashboard/car-values', (req, res) => {
    const carValues = {};

    blogs.forEach(blog => {
        const { Model, Prc } = blog;
        const price = parseInt(Prc.replace(/,/g, ''), 10);

        if (!carValues[Model]) {
            carValues[Model] = 0;
        }
        carValues[Model] += price;
    });

    res.json(carValues);
});

// Get car counts by model
app.get('/dashboard/car-counts', (req, res) => {
    const carCounts = {};

    blogs.forEach(blog => {
        const { Model, NameMMT } = blog;
        const brand = NameMMT.split(' ')[0].toUpperCase(); // Assuming the brand is the first word

        if (!carCounts[brand]) {
            carCounts[brand] = {};
        }
        if (!carCounts[brand][Model]) {
            carCounts[brand][Model] = 0;
        }
        carCounts[brand][Model] += 1;
    });

    res.json(carCounts);
});




// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

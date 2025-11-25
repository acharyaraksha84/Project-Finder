export default function ResearchPaperCard({ paper }) {
  return (
    <a
      href={paper.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block border rounded-lg p-4 shadow-sm hover:shadow-lg transition"
    >
      <h3 className="text-lg font-bold">{paper.title}</h3>

      <p className="text-gray-600 text-sm mt-1">
        {paper.summary.substring(0, 150)}...
      </p>

      <p className="text-gray-500 text-xs mt-2">
        Authors: {paper.authors.join(", ")}
      </p>

      <p className="text-gray-400 text-xs mt-1">
        Published: {new Date(paper.published).toDateString()}
      </p>
    </a>
  );
}

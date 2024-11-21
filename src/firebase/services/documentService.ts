import documentRepository from "../repositories/documentRepository";
import html2canvas from "html2canvas";

export default function documentService() {
  const _documentRepository = documentRepository();

  const downloadHTMLToImage = async (
    elementId: string,
    filename: string = "downloaded-image.jpg"
  ): Promise<void> => {
    try {
      // Get the target element
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // Convert HTML to canvas
      const canvas = await html2canvas(element, {
        logging: false,
        useCORS: true, // Handle cross-origin images
        scale: window.devicePixelRatio, // Ensure proper resolution on high DPI displays
      });

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9); // 0.9 quality for JPEG

      // Create download link
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(dataUrl);
    } catch (error) {
      console.error("Error downloading HTML as image:", error);
      throw error; // Re-throw to allow caller to handle the error
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const isDataUrl = imageUrl.startsWith("data:");

    if (isDataUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.error("Error downloading image:", err);
        });
    }
  };

  return {
    ..._documentRepository,
    downloadHTMLToImage,
    downloadImage,
  };
}

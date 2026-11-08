const [analyzingStatus, setAnalyzingStatus] = useState("");

  // FLERBILDE-HÅNDTERING VED REGISTRERING (MED STEGVIS FREMDRIFT)
  const handleMultipleImageSelection = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsRegisterAnalyzing(true);
    setRegisterAiError("");
    setAnalyzingStatus("1/2 Klargjør og komprimerer bilder...");

    try {
      const compressedList = [];
      for (const file of files) {
        const compressed = await compressImage(file);
        compressedList.push(compressed);
      }

      const updatedImages = [...uploadedImages, ...compressedList];
      setUploadedImages(updatedImages);

      setAnalyzingStatus(`2/2 Gemini AI leser ${updatedImages.length} bilde(r)...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 sek timeout

      const res = await fetch('/api/analyze-skiselector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          images: updatedImages.map(img => ({
            imageBase64: img.base64,
            mimeType: img.mimeType
          }))
        })
      });

      clearTimeout(timeoutId);

      const json = await res.json();
      if (!res.ok) {
        setRegisterAiError(json.error || `Serverfeil: ${res.status}`);
        setIsRegisterAnalyzing(false);
        setAnalyzingStatus("");
        return;
      }

      const d = json.data || {};
      
      // Fyller inn feltene direkte fra Gemini-tolkningen
      setNewSkiData(prev => ({
        ...prev,
        brand: d.brand && d.brand !== "Ukjent" ? d.brand : prev.brand,
        model: d.model || prev.model,
        type: d.type || prev.type,
        tag: d.model ? `#${d.model.toLowerCase().replace(/[^a-z0-9]/g, '')}` : prev.tag,
        lengthCm: d.lengthCm ? Number(d.lengthCm) : prev.lengthCm,
        camberType: d.camberType || prev.camberType,
        grind: d.grind || prev.grind,
        weightKgMin: d.weightMin ? Number(d.weightMin) : prev.weightKgMin,
        weightKgMax: d.weightMax ? Number(d.weightMax) : prev.weightKgMax,
        hbw: (d.hbw !== null && d.hbw !== undefined) ? String(d.hbw) : prev.hbw,
        fbw: (d.fbw !== null && d.fbw !== undefined) ? String(d.fbw) : prev.fbw,
        pocketFrontCm: (d.pocketFront !== null && d.pocketFront !== undefined) ? String(d.pocketFront) : prev.pocketFrontCm,
        pocketRearCm: (d.pocketRear !== null && d.pocketRear !== undefined) ? String(d.pocketRear) : prev.pocketRearCm,
        notes: `Innlest fra ${updatedImages.length} bilde(r) via Gemini AI.`
      }));

      setIsRegisterAnalyzing(false);
      setAnalyzingStatus("");
    } catch (err) {
      const msg = err.name === 'AbortError' 
        ? "Forespørselen tok for lang tid (timeout). Prøv med færre eller mindre bilder." 
        : `Feil: ${err.message}`;
      setRegisterAiError(msg);
      setIsRegisterAnalyzing(false);
      setAnalyzingStatus("");
    }
  };

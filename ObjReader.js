async function readObj(file) {
    const stream = file.stream().pipeThrough(new TextDecoderStream());
    const reader = stream.getReader();

    const vertices = [];
    let leftover = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const lines = (leftover + value).split("\n");
        leftover = lines.pop() ?? "";

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("v ")) {
                const parts = trimmed.split(/\s+/);

                if (parts.length >= 4) {
                    vertices.push(
                        Number(parts[1]),
                        Number(parts[2]),
                        Number(parts[3])
                    );
                }
            }
        }
    }

    if (leftover) {
        const trimmed = leftover.trim();

        if (trimmed.startsWith("v ")) {
            const parts = trimmed.split(/\s+/);

            if (parts.length >= 4) {
                vertices.push(
                    Number(parts[1]),
                    Number(parts[2]),
                    Number(parts[3])
                );
            }
        }
    }

    return new Float32Array(vertices);
}
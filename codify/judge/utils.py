def normalize_output(output: str) -> str:
    if output is None:
        return ""
    # remove trailing spaces from each line and remove extra blank lines
    lines = [line.rstrip() for line in output.strip().splitlines()]
    return "\n".join(lines)


# def compare_output(actual: str, expected: str) -> bool:
#     return normalize_output(actual) == normalize_output(expected)

def compare_output(actual, expected):
    actual = "\n".join(line.rstrip() for line in actual.strip().splitlines())
    expected = "\n".join(line.rstrip() for line in expected.strip().splitlines())
    return actual == expected
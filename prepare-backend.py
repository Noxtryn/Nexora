"""Build the reviewed backend from the source archive; no credentials involved."""
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile

root = Path(__file__).resolve().parent
destination = root / 'backend'
with ZipFile(root / 'nexora-source.zip') as archive:
    for entry in archive.infolist():
        target = (destination / entry.filename).resolve()
        if not target.is_relative_to(destination.resolve()):
            raise ValueError('Invalid source archive path')
    archive.extractall(destination)
bot = destination / 'discord-bot'
subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(bot / 'requirements.txt'),
                '-r', str(bot / 'requirements-dashboard.txt')], check=True)
subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-t', '.'], cwd=bot, check=True)

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Nightlight_Launcher
{
    public partial class Form2 : Form
    {
        private string selectedFolderPath;

        public Form2()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            DownloadFiles();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            if (selectedFolderPath != null && File.Exists(Path.Combine(selectedFolderPath, "PlayGTAV.exe")))
            {
                try
                {
                    System.Diagnostics.Process.Start(Path.Combine(selectedFolderPath, "PlayGTAV.exe"));
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Nije moguće pokrenuti PlayGTAV.exe: {ex.Message}");
                }
            }
            else
            {
                MessageBox.Show("Lokacija nije tačna ili PlayGTAV.exe nije pronađen u izabranom folderu.");
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {
            using (FolderBrowserDialog folderDialog = new FolderBrowserDialog())
            {
                // Prikazivanje FolderBrowserDialog dijaloga
                DialogResult result = folderDialog.ShowDialog();

                // Provera da li je korisnik izabrao folder i kliknuo OK
                if (result == DialogResult.OK && !string.IsNullOrWhiteSpace(folderDialog.SelectedPath))
                {
                    // Prikazivanje izabrane putanje u TextBox kontroli
                    selectedFolderPath = folderDialog.SelectedPath;
                    selectedFolderTextBox.Text = selectedFolderPath;
                }
            }
        }

        private void textBox1_TextChanged(object sender, EventArgs e)
        {
            selectedFolderPath = selectedFolderTextBox.Text;
        }
        private void DownloadFiles()
        {
            string[] fileUrls = new string[]
            {
                "https://cdn.discordapp.com/attachments/1117799715405303808/1134643520557301820/launc.dll",
                "https://cdn.discordapp.com/attachments/1117799715405303808/1134643520976728084/orig_socialclub.dll",
                "https://cdn.discordapp.com/attachments/1117799715405303808/1134643521341636658/PlayGTAV.exe",
                "https://cdn.discordapp.com/attachments/1117799715405303808/1134643522419568750/bink2w64.dll"
            };

            if (selectedFolderPath != null && Directory.Exists(selectedFolderPath))
            {
                using (var client = new WebClient())
                {
                    foreach (var url in fileUrls)
                    {
                        try
                        {
                            string fileName = Path.GetFileName(url);
                            string filePath = Path.Combine(selectedFolderPath, fileName);
                            client.DownloadFile(url, filePath);
                        }
                        catch (Exception ex)
                        {
                            MessageBox.Show($"Greška prilikom preuzimanja fajla: {ex.Message}");
                        }
                    }
                }
            }
            else
            {
                MessageBox.Show("Nije izabran odgovarajući folder za prebacivanje fajlova.");
            }
        }
    }
}
